package com.smartsupport.app.ui.home

import com.smartsupport.app.domain.model.PostItem

sealed class HomeUiState {
    data object Loading : HomeUiState()

    data class Content(
        val posts: List<PostItem>,
        val filter: String,
    ) : HomeUiState() {
        val visiblePosts: List<PostItem>
            get() {
                val q = filter.trim().lowercase()
                if (q.isEmpty()) return posts
                return posts.filter {
                    it.title.lowercase().contains(q) || it.bodyPreview.lowercase().contains(q)
                }
            }
    }

    data object Empty : HomeUiState()

    data class Error(
        val message: String,
        val canRetry: Boolean,
    ) : HomeUiState()
}
