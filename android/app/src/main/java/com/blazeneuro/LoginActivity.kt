package com.blazeneuro

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.text.method.PasswordTransformationMethod
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private val TAG = "LoginActivity"
    private var passwordVisible = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        AuthApi.init(this)

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val btnGoogle = findViewById<Button>(R.id.btnGoogle)
        val btnGithub = findViewById<Button>(R.id.btnGithub)
        val tvError = findViewById<TextView>(R.id.tvError)
        val tvForgotPassword = findViewById<TextView>(R.id.tvForgotPassword)
        val tvSignupLink = findViewById<TextView>(R.id.tvSignupLink)
        val btnTogglePassword = findViewById<TextView>(R.id.btnTogglePassword)
        val btnBack = findViewById<TextView>(R.id.btnBack)
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)

        // Back button
        btnBack.setOnClickListener { finish() }

        // Password toggle
        btnTogglePassword.setOnClickListener {
            passwordVisible = !passwordVisible
            if (passwordVisible) {
                etPassword.transformationMethod = null
                btnTogglePassword.text = "🙈"
            } else {
                etPassword.transformationMethod = PasswordTransformationMethod.getInstance()
                btnTogglePassword.text = "👁"
            }
            etPassword.setSelection(etPassword.text.length)
        }

        // Email login
        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()

            if (email.isEmpty() || password.isEmpty()) {
                showError(tvError, "Please fill all fields")
                return@setOnClickListener
            }

            setLoading(true, btnLogin, progressBar)
            tvError.visibility = View.GONE

            lifecycleScope.launch {
                try {
                    val result = AuthApi.signInEmail(email, password)
                    if (result.success) {
                        navigateToHome()
                    } else {
                        showError(tvError, result.error ?: "Login failed")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Login error", e)
                    showError(tvError, "Login failed: ${e.message}")
                } finally {
                    setLoading(false, btnLogin, progressBar)
                }
            }
        }

        // Google sign-in via Chrome Custom Tabs
        btnGoogle.setOnClickListener {
            openSocialAuth("google")
        }

        // GitHub sign-in via Chrome Custom Tabs
        btnGithub.setOnClickListener {
            openSocialAuth("github")
        }

        // Forgot password
        tvForgotPassword.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }

        // Signup link
        tvSignupLink.setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
            finish()
        }

        // Handle callback from social auth
        handleSocialAuthCallback(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleSocialAuthCallback(intent)
    }

    private fun handleSocialAuthCallback(intent: Intent?) {
        val data = intent?.data ?: return
        Log.d(TAG, "Received callback: $data")

        if (data.scheme == "blazeneuro" && data.host == "callback") {
            // After social login, check session
            lifecycleScope.launch {
                val result = AuthApi.getSession()
                if (result.success) {
                    navigateToHome()
                } else {
                    showError(
                        findViewById(R.id.tvError),
                        "Social login completed but session not found. Please try email login."
                    )
                }
            }
        }
    }

    private fun openSocialAuth(provider: String) {
        val callbackUrl = "${AuthApi.AUTH_BASE_URL}/callback"
        val url = when (provider) {
            "google" -> AuthApi.getGoogleSignInUrl(callbackUrl)
            "github" -> AuthApi.getGithubSignInUrl(callbackUrl)
            else -> return
        }

        try {
            val customTabsIntent = CustomTabsIntent.Builder()
                .setShowTitle(true)
                .build()
            customTabsIntent.launchUrl(this, Uri.parse(url))
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open Custom Tab", e)
            // Fallback to browser
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
    }

    private fun navigateToHome() {
        startActivity(Intent(this, HomeActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        })
        finish()
    }

    private fun showError(tvError: TextView, message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun setLoading(loading: Boolean, btn: Button, progressBar: ProgressBar) {
        btn.isEnabled = !loading
        btn.text = if (loading) "Logging in..." else "Login"
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
    }
}
