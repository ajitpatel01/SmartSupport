package com.smartsupport.app.ui.home

import androidx.lifecycle.SavedStateHandle
import com.smartsupport.app.MainDispatcherRule
import com.smartsupport.app.data.remote.NetworkFailure
import com.smartsupport.app.data.remote.NetworkResult
import com.smartsupport.app.data.repository.PostsRepository
import com.smartsupport.app.domain.GetPostsUseCase
import com.smartsupport.app.domain.model.PostItem
import com.smartsupport.app.security.SecurePrefs
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class HomeViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `emits Content when posts load`() = runTest {
        val repo = object : PostsRepository {
            override suspend fun loadPosts() =
                NetworkResult.Ok(listOf(PostItem(1, "title", "body")))
        }
        val securePrefs = mockk<SecurePrefs>(relaxed = true)
        val vm = HomeViewModel(
            SavedStateHandle(),
            GetPostsUseCase(repo),
            securePrefs,
            analytics = null,
            ioDispatcher = Dispatchers.Unconfined,
        )
        val state = vm.uiState.value
        assertTrue(state is HomeUiState.Content)
        assertEquals(1, (state as HomeUiState.Content).posts.size)
        verify { securePrefs.setSessionHint("demo") }
    }

    @Test
    fun `emits Error when repository fails`() = runTest {
        val repo = object : PostsRepository {
            override suspend fun loadPosts() =
                NetworkResult.Err(NetworkFailure.NoConnection)
        }
        val vm = HomeViewModel(
            SavedStateHandle(),
            GetPostsUseCase(repo),
            mockk(relaxed = true),
            analytics = null,
            ioDispatcher = Dispatchers.Unconfined,
        )
        val state = vm.uiState.value
        assertTrue(state is HomeUiState.Error)
        assertTrue((state as HomeUiState.Error).message.contains("internet", ignoreCase = true))
    }

    @Test
    fun `emits Empty when list is empty`() = runTest {
        val repo = object : PostsRepository {
            override suspend fun loadPosts() = NetworkResult.Ok(emptyList())
        }
        val vm = HomeViewModel(
            SavedStateHandle(),
            GetPostsUseCase(repo),
            mockk(relaxed = true),
            analytics = null,
            ioDispatcher = Dispatchers.Unconfined,
        )
        assertTrue(vm.uiState.value is HomeUiState.Empty)
    }
}
