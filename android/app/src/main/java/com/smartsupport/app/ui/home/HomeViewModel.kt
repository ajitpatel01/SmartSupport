package com.smartsupport.app.ui.home

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartsupport.app.analytics.AnalyticsTracker
import com.smartsupport.app.data.remote.NetworkFailure
import com.smartsupport.app.data.remote.NetworkResult
import com.smartsupport.app.domain.GetPostsUseCase
import com.smartsupport.app.security.SecurePrefs
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class HomeViewModel(
    private val savedStateHandle: SavedStateHandle,
    private val getPostsUseCase: GetPostsUseCase,
    private val securePrefs: SecurePrefs,
    private val analytics: AnalyticsTracker? = null,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) : ViewModel() {

    private val draftFilter = savedStateHandle.getStateFlow(DRAFT_FILTER_KEY, "")

    private val loadState = MutableStateFlow<LoadState>(LoadState.Loading)

    val uiState: StateFlow<HomeUiState> = combine(loadState, draftFilter) { load, filter ->
        when (load) {
            is LoadState.Loading -> HomeUiState.Loading
            is LoadState.Error -> HomeUiState.Error(load.message, load.canRetry)
            is LoadState.Ready -> {
                if (load.posts.isEmpty()) {
                    HomeUiState.Empty
                } else {
                    HomeUiState.Content(load.posts, filter)
                }
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = HomeUiState.Loading,
    )

    init {
        refresh()
    }

    fun onFilterChange(value: String) {
        savedStateHandle[DRAFT_FILTER_KEY] = value
        analytics?.logUserAction(
            AnalyticsTracker.ACTION_FILTER_CHANGED,
            mapOf(AnalyticsTracker.PARAM_FILTER_LENGTH to value.length.toString()),
        )
    }

    fun retry() {
        analytics?.logUserAction(AnalyticsTracker.ACTION_RETRY_LOAD)
        refresh()
    }

    private fun refresh() {
        viewModelScope.launch {
            loadState.value = LoadState.Loading
            val result = withContext(ioDispatcher) {
                getPostsUseCase()
            }
            when (result) {
                is NetworkResult.Ok -> {
                    securePrefs.setSessionHint("demo")
                    loadState.update {
                        LoadState.Ready(result.value)
                    }
                }
                is NetworkResult.Err -> {
                    loadState.update {
                        LoadState.Error(
                            message = result.failure.toUserMessage(),
                            canRetry = true,
                        )
                    }
                }
            }
        }
    }

    private sealed class LoadState {
        data object Loading : LoadState()
        data class Ready(val posts: List<com.smartsupport.app.domain.model.PostItem>) : LoadState()
        data class Error(val message: String, val canRetry: Boolean) : LoadState()
    }

    private fun NetworkFailure.toUserMessage(): String = when (this) {
        NetworkFailure.NoConnection -> "No internet connection."
        is NetworkFailure.Http -> when (code) {
            in 500..599 -> "Server error. Try again later."
            else -> "Request failed ($code)."
        }
        NetworkFailure.Timeout -> "Request timed out."
        is NetworkFailure.Unknown -> message ?: "Something went wrong."
    }

    companion object {
        private const val DRAFT_FILTER_KEY = "draft_filter"
    }
}
