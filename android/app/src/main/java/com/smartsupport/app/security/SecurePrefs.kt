package com.smartsupport.app.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Demo token storage using EncryptedSharedPreferences (AES256-GCM).
 * Replace demo key names with real auth tokens when integrating SmartSupport API.
 */
class SecurePrefs(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "smartsupport_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    fun getSessionHint(): String? = prefs.getString(KEY_SESSION_HINT, null)

    fun setSessionHint(value: String?) {
        prefs.edit().apply {
            if (value == null) remove(KEY_SESSION_HINT)
            else putString(KEY_SESSION_HINT, value)
        }.apply()
    }

    companion object {
        private const val KEY_SESSION_HINT = "session_hint"
    }
}
