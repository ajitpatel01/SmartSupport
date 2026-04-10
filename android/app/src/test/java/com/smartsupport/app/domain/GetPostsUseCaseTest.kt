package com.smartsupport.app.domain

import com.smartsupport.app.data.remote.NetworkFailure
import com.smartsupport.app.data.remote.NetworkResult
import com.smartsupport.app.data.repository.PostsRepository
import com.smartsupport.app.domain.model.PostItem
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class GetPostsUseCaseTest {

    @Test
    fun `invoke returns repository result on success`() = runTest {
        val items = listOf(PostItem(1, "a", "b"))
        val repo = object : PostsRepository {
            override suspend fun loadPosts() = NetworkResult.Ok(items)
        }
        val result = GetPostsUseCase(repo)()
        assertTrue(result is NetworkResult.Ok)
        assertEquals(items, (result as NetworkResult.Ok).value)
    }

    @Test
    fun `invoke returns error when repository fails`() = runTest {
        val repo = object : PostsRepository {
            override suspend fun loadPosts() =
                NetworkResult.Err(NetworkFailure.Http(500))
        }
        val result = GetPostsUseCase(repo)()
        assertTrue(result is NetworkResult.Err)
        assertEquals(500, (result as NetworkResult.Err).failure.let { (it as NetworkFailure.Http).code })
    }
}
