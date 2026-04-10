package com.smartsupport.app.data.repository

import com.smartsupport.app.data.remote.NetworkResult
import com.smartsupport.app.domain.model.PostItem

interface PostsRepository {
    suspend fun loadPosts(): NetworkResult<List<PostItem>>
}
