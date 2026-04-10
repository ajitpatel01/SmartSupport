package com.smartsupport.app.data.remote

import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.net.ssl.SSLException

fun Throwable.toNetworkFailure(): NetworkFailure = when (this) {
    is SocketTimeoutException -> NetworkFailure.Timeout
    is UnknownHostException -> NetworkFailure.NoConnection
    is IOException -> {
        val msg = message?.lowercase().orEmpty()
        if (msg.contains("unable to resolve") || msg.contains("network")) {
            NetworkFailure.NoConnection
        } else {
            NetworkFailure.Unknown(message)
        }
    }
    is SSLException -> NetworkFailure.Unknown(message)
    else -> NetworkFailure.Unknown(message)
}
