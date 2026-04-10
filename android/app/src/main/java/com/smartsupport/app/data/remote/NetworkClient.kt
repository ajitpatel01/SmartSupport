package com.smartsupport.app.data.remote

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkClient {

    private const val CONNECT_SEC = 15L
    private const val READ_SEC = 30L
    private const val WRITE_SEC = 30L

    fun create(debug: Boolean): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .connectTimeout(CONNECT_SEC, TimeUnit.SECONDS)
            .readTimeout(READ_SEC, TimeUnit.SECONDS)
            .writeTimeout(WRITE_SEC, TimeUnit.SECONDS)
        if (debug) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC
            }
            builder.addInterceptor(logging)
        }
        return builder.build()
    }

    fun createRetrofit(client: OkHttpClient, baseUrl: String): Retrofit =
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
}
