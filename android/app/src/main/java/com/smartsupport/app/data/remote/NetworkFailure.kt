package com.smartsupport.app.data.remote

sealed class NetworkFailure {
    data object NoConnection : NetworkFailure()
    data class Http(val code: Int) : NetworkFailure()
    data object Timeout : NetworkFailure()
    data class Unknown(val message: String?) : NetworkFailure()
}

sealed class NetworkResult<out T> {
    data class Ok<T>(val value: T) : NetworkResult<T>()
    data class Err(val failure: NetworkFailure) : NetworkResult<Nothing>()
}
