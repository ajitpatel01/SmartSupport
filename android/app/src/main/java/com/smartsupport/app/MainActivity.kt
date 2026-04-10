package com.smartsupport.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.smartsupport.app.ui.home.HomeScreen
import com.smartsupport.app.ui.home.HomeViewModel
import com.smartsupport.app.ui.navigation.Screen
import com.smartsupport.app.ui.theme.SmartSupportTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = (application as SmartSupportApplication).container

        setContent {
            SmartSupportTheme {
                val vm: HomeViewModel = viewModel(factory = container.homeViewModelFactory())
                androidx.compose.runtime.LaunchedEffect(Unit) {
                    container.analyticsTracker.logScreen(Screen.Home)
                }
                HomeScreen(
                    viewModel = vm,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
    }
}
