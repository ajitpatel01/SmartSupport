package com.smartsupport.app.analytics

import android.os.Bundle
import com.google.firebase.analytics.FirebaseAnalytics
import com.smartsupport.app.ui.navigation.Screen

class AnalyticsTracker(
    private val analytics: FirebaseAnalytics,
) {

    fun logScreen(screen: Screen) {
        val bundle = Bundle().apply {
            putString(FirebaseAnalytics.Param.SCREEN_NAME, screen.route)
            putString(FirebaseAnalytics.Param.SCREEN_CLASS, screen.analyticsLabel)
        }
        analytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW, bundle)
    }

    fun logUserAction(action: String, params: Map<String, String> = emptyMap()) {
        val bundle = Bundle().apply {
            params.forEach { (k, v) -> putString(k, v) }
        }
        analytics.logEvent(action, bundle)
    }

    companion object {
        const val ACTION_RETRY_LOAD = "retry_load_posts"
        const val ACTION_FILTER_CHANGED = "filter_changed"
        const val PARAM_FILTER_LENGTH = "filter_length"
    }
}
