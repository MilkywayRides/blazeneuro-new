package com.blazeneuro

import android.Manifest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import com.blazeneuro.location.LocationService

class MainActivity : ComponentActivity() {
    private lateinit var locationService: LocationService

    private val locationPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) locationService.startTracking()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        locationService = LocationService(this)
        locationPermission.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        
        setContent {
            // Your existing UI
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        locationService.stopTracking()
    }
}
