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

        window.decorView.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
        window.statusBarColor = android.graphics.Color.TRANSPARENT

        AuthApi.init(this)
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            val nightMode = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
            if (nightMode == android.content.res.Configuration.UI_MODE_NIGHT_YES) {
                window.decorView.systemUiVisibility = (
                    android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                )
            } else {
                window.decorView.systemUiVisibility = (
                    android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
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

        val circle1 = findViewById<android.view.View>(R.id.circle1)
        val circle2 = findViewById<android.view.View>(R.id.circle2)
        
        animateCircle1(circle1)
        animateCircle2(circle2)
        
        setupTermsText()

        findViewById<android.widget.Button>(R.id.btnLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<android.widget.Button>(R.id.btnSignup).setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }
    
    private fun setupTermsText() {
        val termsText = findViewById<android.widget.TextView>(R.id.termsText)
        val text = "By continuing, you agree to our Terms of Service\nand Privacy Policy"
        val spannableString = android.text.SpannableString(text)
        
        val termsStart = text.indexOf("Terms of Service")
        val termsEnd = termsStart + "Terms of Service".length
        val privacyStart = text.indexOf("Privacy Policy")
        val privacyEnd = privacyStart + "Privacy Policy".length
        
        val termsClickable = object : android.text.style.ClickableSpan() {
            override fun onClick(widget: android.view.View) {
                openUrl("https://blazeneuro.com/terms")
            }
            override fun updateDrawState(ds: android.text.TextPaint) {
                super.updateDrawState(ds)
                ds.isUnderlineText = true
                ds.color = android.graphics.Color.parseColor("#71717A")
            }
        }
        
        val privacyClickable = object : android.text.style.ClickableSpan() {
            override fun onClick(widget: android.view.View) {
                openUrl("https://blazeneuro.com/privacy")
            }
            override fun updateDrawState(ds: android.text.TextPaint) {
                super.updateDrawState(ds)
                ds.isUnderlineText = true
                ds.color = android.graphics.Color.parseColor("#71717A")
            }
        }
        
        spannableString.setSpan(termsClickable, termsStart, termsEnd, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        spannableString.setSpan(privacyClickable, privacyStart, privacyEnd, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        
        termsText.text = spannableString
        termsText.movementMethod = android.text.method.LinkMovementMethod.getInstance()
        termsText.highlightColor = android.graphics.Color.TRANSPARENT
    }
    
    private fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
        startActivity(intent)
    }
    
    private fun animateCircle1(view: android.view.View) {
        view.animate()
            .translationY(80f)
            .setDuration(8000)
            .setInterpolator(android.view.animation.LinearInterpolator())
            .withEndAction {
                view.animate()
                    .translationY(0f)
                    .setDuration(8000)
                    .setInterpolator(android.view.animation.LinearInterpolator())
                    .withEndAction { animateCircle1(view) }
                    .start()
            }
            .start()
    }
    
    private fun animateCircle2(view: android.view.View) {
        view.animate()
            .translationX(40f)
            .setDuration(10000)
            .setInterpolator(android.view.animation.LinearInterpolator())
            .withEndAction {
                view.animate()
                    .translationX(0f)
                    .setDuration(10000)
                    .setInterpolator(android.view.animation.LinearInterpolator())
                    .withEndAction { animateCircle2(view) }
                    .start()
            }
            .start()
    }
}
