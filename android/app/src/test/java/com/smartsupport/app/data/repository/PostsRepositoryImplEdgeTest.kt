package com.smartsupport.app.data.repository

import com.smartsupport.app.data.remote.NetworkFailure
import com.smartsupport.app.data.remote.NetworkResult
import com.smartsupport.app.data.remote.PostsApi
import com.smartsupport.app.data.remote.dto.PostDto
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertTrue
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

/**
 * Edge cases: null-heavy API payloads should not throw (mapNotNull / safe defaults).
 */
class PostsRepositoryImplEdgeTest {

    @Test
    fun `null ids are skipped without crashing`() = runTest {
        val api = mockk<PostsApi>()
        coEvery { api.getPosts() } returns listOf(
            PostDto(userId = 1, id = null, title = "x", body = "y"),
            PostDto(userId = 1, id = 2, title = "ok", body = "body"),
        )
        val repo = PostsRepositoryImpl(api)
        val result = repo.loadPosts()
        assertTrue(result is NetworkResult.Ok)
        assertTrue((result as NetworkResult.Ok).value.single().id == 2)
    }

    @Test
    fun `empty title rows are skipped`() = runTest {
        val api = mockk<PostsApi>()
        coEvery { api.getPosts() } returns listOf(
            PostDto(userId = 1, id = 1, title = " ", body = "y"),
            PostDto(userId = 1, id = 2, title = "valid", body = "b"),
        )
        val repo = PostsRepositoryImpl(api)
        val result = repo.loadPosts()
        assertTrue(result is NetworkResult.Ok)
        assertTrue((result as NetworkResult.Ok).value.single().title == "valid")
    }

    @Test
    fun `http error maps to Err`() = runTest {
        val api = mockk<PostsApi>()
        val err = HttpException(
            Response.error<List<PostDto>>(
                500,
                "{}".toResponseBody("application/json".toMediaType()),
            ),
        )
        coEvery { api.getPosts() } throws err
        val repo = PostsRepositoryImpl(api)
        val result = repo.loadPosts()
        assertTrue(result is NetworkResult.Err)
        assertTrue((result as NetworkResult.Err).failure is NetworkFailure.Http)
    }
}
