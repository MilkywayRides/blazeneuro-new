package com.blazeneuro

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class SplashActivity : AppCompatActivity() {
    private val taglines = listOf(
        "Ignite Your Mind",
        "Build Sharper Focus",
        "Learn Without Limits",
        "Train Your Curiosity",
        "Think Deeper Daily",
        "Unlock Better Ideas",
        "Grow Smarter Today"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        )
        window.statusBarColor = android.graphics.Color.TRANSPARENT
        window.navigationBarColor = android.graphics.Color.TRANSPARENT
        
        val logo = findViewById<TextView>(R.id.tvLogo)
        val tagline = findViewById<TextView>(R.id.tvTagline)
        tagline.text = nextTagline()
        
        logo.alpha = 0f
        tagline.alpha = 0f
        
        logo.animate().alpha(1f).setDuration(800).start()
        tagline.animate().alpha(1f).setDuration(800).setStartDelay(400).start()
        
        lifecycleScope.launch {
            delay(2500)
            startActivity(Intent(this@SplashActivity, MainActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }
    }

    private fun nextTagline(): String {
        val prefs = getSharedPreferences("splash", MODE_PRIVATE)
        val nextIndex = (prefs.getInt("tagline_index", -1) + 1) % taglines.size
        prefs.edit().putInt("tagline_index", nextIndex).apply()
        return taglines[nextIndex]
    }
}
