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

        AuthApi.init(this)

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

        findViewById<android.widget.Button>(R.id.btnLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<android.widget.Button>(R.id.btnSignup).setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }
}
