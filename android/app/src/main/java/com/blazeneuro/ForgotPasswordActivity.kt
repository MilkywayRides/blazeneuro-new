package com.blazeneuro

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class ForgotPasswordActivity : AppCompatActivity() {
    private val TAG = "ForgotPasswordActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_forgot_password)
        AuthApi.init(this)

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val btnSubmit = findViewById<Button>(R.id.btnSubmit)
        val tvMessage = findViewById<TextView>(R.id.tvMessage)
        val tvLoginLink = findViewById<TextView>(R.id.tvLoginLink)
        val btnBack = findViewById<TextView>(R.id.btnBack)
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)

        // Back button
        btnBack.setOnClickListener { finish() }

        // Login link
        tvLoginLink.setOnClickListener { finish() }

        // Submit
        btnSubmit.setOnClickListener {
            val email = etEmail.text.toString().trim()

            if (email.isEmpty()) {
                showMessage(tvMessage, "Please enter your email", true)
                return@setOnClickListener
            }

            btnSubmit.isEnabled = false
            btnSubmit.text = "Sending..."
            progressBar.visibility = View.VISIBLE
            tvMessage.visibility = View.GONE

            lifecycleScope.launch {
                try {
                    val result = AuthApi.forgotPassword(email)
                    if (result.success) {
                        showMessage(tvMessage, "Reset link sent! Check your email.", false)
                    } else {
                        showMessage(tvMessage, result.error ?: "Failed to send reset link", true)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Forgot password error", e)
                    showMessage(tvMessage, "Failed: ${e.message}", true)
                } finally {
                    btnSubmit.isEnabled = true
                    btnSubmit.text = "Send Reset Link"
                    progressBar.visibility = View.GONE
                }
            }
        }
    }

    private fun showMessage(tvMessage: TextView, message: String, isError: Boolean) {
        tvMessage.text = message
        tvMessage.setTextColor(
            ContextCompat.getColor(this, if (isError) R.color.error else R.color.success)
        )
        tvMessage.setBackgroundResource(
            if (isError) R.drawable.error_background else 0
        )
        tvMessage.visibility = View.VISIBLE
    }
}
