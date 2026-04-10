package com.smartsupport.app.domain

import com.smartsupport.app.data.remote.NetworkResult
import com.smartsupport.app.data.repository.PostsRepository
import com.smartsupport.app.domain.model.PostItem

class GetPostsUseCase(
    private val repository: PostsRepository,
) {
    suspend operator fun invoke(): NetworkResult<List<PostItem>> = repository.loadPosts()
}
