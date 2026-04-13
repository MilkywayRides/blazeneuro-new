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
    private lateinit var gitHubAuthManager: GitHubAuthManager
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        window.decorView.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
        window.statusBarColor = android.graphics.Color.TRANSPARENT
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            val nightMode = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
            if (nightMode == android.content.res.Configuration.UI_MODE_NIGHT_YES) {
                window.decorView.systemUiVisibility = (
                    android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                )
            }
        }
        
        setContentView(R.layout.activity_signup)
        
        window.setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        
        AuthApi.init(this)

        val etName = findViewById<EditText>(R.id.etName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnSignup = findViewById<LinearLayout>(R.id.btnSignup)
        val btnGoogle = findViewById<Button>(R.id.btnGoogle)
        val btnGithub = findViewById<Button>(R.id.btnGithub)
        val tvError = findViewById<TextView>(R.id.tvError)
        val tvLoginLink = findViewById<TextView>(R.id.tvLoginLink)
        val btnTogglePassword = findViewById<ImageView>(R.id.btnTogglePassword)
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)
        
        val googleAuthManager = GoogleAuthManager(this)
        gitHubAuthManager = GitHubAuthManager(this)
        sessionManager = SessionManager(this)
        
        handleGitHubDeepLink(intent)
        
        setupTermsText()

        // Password toggle
        btnTogglePassword.setOnClickListener {
            passwordVisible = !passwordVisible
            if (passwordVisible) {
                etPassword.transformationMethod = null
                btnTogglePassword.setImageResource(R.drawable.ic_eye_closed)
            } else {
                etPassword.transformationMethod = PasswordTransformationMethod.getInstance()
                btnTogglePassword.setImageResource(R.drawable.ic_eye_open)
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
        btnGoogle.setOnClickListener {
            handleGoogleSignIn(googleAuthManager, sessionManager, tvError, progressBar)
        }
        btnGithub.setOnClickListener { 
            gitHubAuthManager.launchGitHubSignIn()
        }

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

    private fun setLoading(loading: Boolean, btn: LinearLayout, progressBar: ProgressBar) {
        btn.isEnabled = !loading
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
    }
    
    private fun setupTermsText() {
        val termsText = findViewById<TextView>(R.id.termsTextSignup)
        val text = "By continuing, you agree to our Terms of Service and Privacy Policy"
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
    
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleGitHubDeepLink(intent)
    }
    
    private fun handleGitHubDeepLink(intent: Intent) {
        val data = intent.data
        if (data != null && data.scheme == "blazeneuro" && data.host == "github-callback") {
            val code = data.getQueryParameter("code")
            val state = data.getQueryParameter("state")
            val savedState = gitHubAuthManager.getState()

            if (code != null && state != null && state == savedState) {
                lifecycleScope.launch {
                    sendGitHubCodeToBackend(code, state)
                }
            } else {
                android.widget.Toast.makeText(this, "GitHub sign-in failed", android.widget.Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private suspend fun sendGitHubCodeToBackend(code: String, state: String) {
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)
        val tvError = findViewById<TextView>(R.id.tvError)
        
        progressBar.visibility = View.VISIBLE
        tvError.visibility = View.GONE
        
        try {
            val response = RetrofitClient.authService.verifyGitHubCode(
                GitHubCodeRequest(code = code, state = state)
            )
            sessionManager.saveToken(response.token)
            
            AuthApi.saveSessionFromGoogle(
                this,
                response.token,
                response.user.name ?: "",
                response.user.email,
                null,
                response.user.id
            )
            
            progressBar.visibility = View.GONE
            navigateToHome()
        } catch (e: Exception) {
            progressBar.visibility = View.GONE
            showError(tvError, "GitHub auth failed: ${e.message}")
        }
    }
    
    private fun handleGoogleSignIn(
        googleAuthManager: GoogleAuthManager,
        sessionManager: SessionManager,
        tvError: TextView,
        progressBar: ProgressBar
    ) {
        progressBar.visibility = View.VISIBLE
        tvError.visibility = View.GONE
        
        lifecycleScope.launch {
            googleAuthManager.getIdToken()
                .onSuccess { idToken ->
                    sendGoogleTokenToBackend(idToken, sessionManager, tvError, progressBar)
                }
                .onFailure { error ->
                    progressBar.visibility = View.GONE
                    showError(tvError, "Sign-in failed: ${error.message}")
                }
        }
    }
    
    private suspend fun sendGoogleTokenToBackend(
        idToken: String,
        sessionManager: SessionManager,
        tvError: TextView,
        progressBar: ProgressBar
    ) {
        try {
            val response = RetrofitClient.authService.verifyGoogleToken(
                GoogleIdTokenRequest(idToken = idToken)
            )
            sessionManager.saveToken(response.token)
            
            AuthApi.saveSessionFromGoogle(
                this,
                response.token,
                response.user.name ?: "",
                response.user.email,
                null,
                response.user.id
            )
            
            progressBar.visibility = View.GONE
            navigateToHome()
        } catch (e: Exception) {
            progressBar.visibility = View.GONE
            showError(tvError, "Authentication failed: ${e.message}")
        }
    }
}
