package com.blazeneuro

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        applyTheme()
        super.onCreate(savedInstanceState)

        // Make status bar transparent
        window.decorView.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
        window.statusBarColor = android.graphics.Color.TRANSPARENT

        AuthApi.init(this)
        
        // Set status bar appearance based on theme
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            val nightMode = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
            if (nightMode == android.content.res.Configuration.UI_MODE_NIGHT_NO) {
                // Light mode - dark status bar icons
                window.decorView.systemUiVisibility = (
                    android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                )
            }
        }

        // Check for existing session
        if (AuthApi.hasSession()) {
            // Verify session is still valid
            lifecycleScope.launch {
                val result = AuthApi.getSession()
                if (result.success) {
                    startActivity(Intent(this@MainActivity, HomeActivity::class.java))
                    finish()
                } else {
                    showWelcomeScreen()
                }
            }
        } else {
            showWelcomeScreen()
        }
    }
    
    private fun applyTheme() {
        val prefs = getSharedPreferences("settings", MODE_PRIVATE)
        val theme = prefs.getString("theme", "system")
        val mode = when (theme) {
            "light" -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO
            "dark" -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_YES
            else -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
        androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(mode)
    }

    private fun showWelcomeScreen() {
        setContentView(R.layout.activity_main)

        // Animate circles with hardware layers for better performance
        val circle1 = findViewById<android.view.View>(R.id.circle1)
        val circle2 = findViewById<android.view.View>(R.id.circle2)
        
        circle1.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)
        circle2.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)
        
        animateCircle1(circle1)
        animateCircle2(circle2)

        findViewById<android.widget.Button>(R.id.btnLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<android.widget.Button>(R.id.btnSignup).setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }
    
    private fun animateCircle1(view: android.view.View) {
        view.animate()
            .translationY(100f)
            .setDuration(3000)
            .setInterpolator(android.view.animation.AccelerateDecelerateInterpolator())
            .withEndAction {
                view.animate()
                    .translationY(0f)
                    .setDuration(3000)
                    .withEndAction { animateCircle1(view) }
                    .start()
            }
            .start()
    }
    
    private fun animateCircle2(view: android.view.View) {
        view.animate()
            .translationX(50f)
            .setDuration(4000)
            .setInterpolator(android.view.animation.AccelerateDecelerateInterpolator())
            .withEndAction {
                view.animate()
                    .translationX(0f)
                    .setDuration(4000)
                    .withEndAction { animateCircle2(view) }
                    .start()
            }
            .start()
    }
}
