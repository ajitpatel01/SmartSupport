package com.smartsupport.app.data.remote

import com.smartsupport.app.data.remote.dto.PostDto
import retrofit2.http.GET

interface PostsApi {
    @GET("posts")
    suspend fun getPosts(): List<PostDto>
}
