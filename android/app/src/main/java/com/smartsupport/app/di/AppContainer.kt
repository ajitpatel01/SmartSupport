package com.smartsupport.app.di

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.createSavedStateHandle
import androidx.lifecycle.viewmodel.CreationExtras
import com.google.firebase.analytics.FirebaseAnalytics
import com.smartsupport.app.BuildConfig
import com.smartsupport.app.analytics.AnalyticsTracker
import com.smartsupport.app.data.remote.NetworkClient
import com.smartsupport.app.data.remote.PostsApi
import com.smartsupport.app.data.repository.PostsRepository
import com.smartsupport.app.data.repository.PostsRepositoryImpl
import com.smartsupport.app.domain.GetPostsUseCase
import com.smartsupport.app.security.SecurePrefs
import com.smartsupport.app.ui.home.HomeViewModel

class AppContainer(context: Context) {

    private val appContext = context.applicationContext

    private val okHttp = NetworkClient.create(BuildConfig.DEBUG)
    private val retrofit = NetworkClient.createRetrofit(okHttp, BuildConfig.API_BASE_URL)
    private val postsApi: PostsApi = retrofit.create(PostsApi::class.java)

    val postsRepository: PostsRepository = PostsRepositoryImpl(postsApi)
    val getPostsUseCase = GetPostsUseCase(postsRepository)
    val securePrefs = SecurePrefs(appContext)
    val analyticsTracker = AnalyticsTracker(FirebaseAnalytics.getInstance(appContext))

    fun homeViewModelFactory(): ViewModelProvider.Factory =
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val handle = extras.createSavedStateHandle()
                return HomeViewModel(
                    handle,
                    getPostsUseCase,
                    securePrefs,
                    analyticsTracker,
                ) as T
            }
        }
}
