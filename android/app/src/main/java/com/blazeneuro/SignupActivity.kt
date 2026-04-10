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

class SignupActivity : AppCompatActivity() {
    private val TAG = "SignupActivity"
    private var passwordVisible = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)
        AuthApi.init(this)

        val etName = findViewById<EditText>(R.id.etName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnSignup = findViewById<Button>(R.id.btnSignup)
        val btnGoogle = findViewById<Button>(R.id.btnGoogle)
        val btnGithub = findViewById<Button>(R.id.btnGithub)
        val tvError = findViewById<TextView>(R.id.tvError)
        val tvLoginLink = findViewById<TextView>(R.id.tvLoginLink)
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

        // Email signup
        btnSignup.setOnClickListener {
            val name = etName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                showError(tvError, "Please fill all fields")
                return@setOnClickListener
            }

            if (password.length < 8) {
                showError(tvError, "Password must be at least 8 characters")
                return@setOnClickListener
            }

            setLoading(true, btnSignup, progressBar)
            tvError.visibility = View.GONE

            lifecycleScope.launch {
                try {
                    val result = AuthApi.signUpEmail(name, email, password)
                    if (result.success) {
                        navigateToHome()
                    } else {
                        showError(tvError, result.error ?: "Signup failed")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Signup error", e)
                    showError(tvError, "Signup failed: ${e.message}")
                } finally {
                    setLoading(false, btnSignup, progressBar)
                }
            }
        }

        // Social auth
        btnGoogle.setOnClickListener { openSocialAuth("google") }
        btnGithub.setOnClickListener { openSocialAuth("github") }

        // Login link
        tvLoginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
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
        btn.text = if (loading) "Creating account..." else "Create Account"
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
    }
}
