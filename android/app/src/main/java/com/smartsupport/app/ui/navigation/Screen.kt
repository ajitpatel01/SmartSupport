package com.smartsupport.app.ui.navigation

sealed class Screen(val route: String, val analyticsLabel: String) {
    data object Home : Screen("home", "HomeTickets")
}
