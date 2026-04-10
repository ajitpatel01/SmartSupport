package com.smartsupport.app.data.repository

import com.smartsupport.app.data.remote.NetworkFailure
import com.smartsupport.app.data.remote.NetworkResult
import com.smartsupport.app.data.remote.PostsApi
import com.smartsupport.app.data.remote.toNetworkFailure
import com.smartsupport.app.domain.model.PostItem
import retrofit2.HttpException

class PostsRepositoryImpl(
    private val api: PostsApi,
) : PostsRepository {

    override suspend fun loadPosts(): NetworkResult<List<PostItem>> =
        try {
            val raw = api.getPosts()
            val items = raw.mapNotNull { dto ->
                val id = dto.id ?: return@mapNotNull null
                val title = dto.title?.takeIf { it.isNotBlank() } ?: return@mapNotNull null
                val body = dto.body.orEmpty()
                PostItem(
                    id = id,
                    title = title,
                    bodyPreview = body.take(120),
                )
            }
            NetworkResult.Ok(items)
        } catch (e: HttpException) {
            NetworkResult.Err(NetworkFailure.Http(e.code()))
        } catch (e: Exception) {
            NetworkResult.Err(e.toNetworkFailure())
        }
}
