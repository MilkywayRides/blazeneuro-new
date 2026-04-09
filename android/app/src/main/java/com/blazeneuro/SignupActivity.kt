package com.blazeneuro

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class SignupActivity : AppCompatActivity() {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    private val authUrl = "https://auth.blazeneuro.com"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        val etName = findViewById<EditText>(R.id.etName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnSignup = findViewById<Button>(R.id.btnSignup)
        val btnGoogle = findViewById<Button>(R.id.btnGoogle)
        val btnGithub = findViewById<Button>(R.id.btnGithub)
        val tvError = findViewById<TextView>(R.id.tvError)

        btnSignup.setOnClickListener {
            val name = etName.text.toString()
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                tvError.text = "Please fill all fields"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            btnSignup.isEnabled = false
            tvError.visibility = View.GONE

            lifecycleScope.launch {
                try {
                    val result = signup(name, email, password)
                    if (result.success) {
                        val prefs = getSharedPreferences("auth", MODE_PRIVATE)
                        prefs.edit().apply {
                            putString("token", result.token)
                            putString("userName", result.userName)
                            apply()
                        }
                        startActivity(Intent(this@SignupActivity, HomeActivity::class.java))
                        finish()
                    } else {
                        tvError.text = result.error
                        tvError.visibility = View.VISIBLE
                    }
                } catch (e: Exception) {
                    tvError.text = "Signup failed: ${e.message}"
                    tvError.visibility = View.VISIBLE
                } finally {
                    btnSignup.isEnabled = true
                }
            }
        }

        btnGoogle.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("$authUrl/oauth/v1/authorize/google?redirectTo=https://blazeneuro.com"))
            startActivity(intent)
        }

        btnGithub.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("$authUrl/oauth/v1/authorize/github?redirectTo=https://blazeneuro.com"))
            startActivity(intent)
        }
    }

    private suspend fun signup(name: String, email: String, password: String): SignupResult = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("name", name)
                put("email", email)
                put("password", password)
            }

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$authUrl/api/auth/sign-up/email")
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build()

            android.util.Log.d("SignupActivity", "Sending request to: $authUrl/api/auth/sign-up/email")
            android.util.Log.d("SignupActivity", "Request body: ${json.toString()}")
            
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            
            android.util.Log.d("SignupActivity", "Response code: ${response.code}")
            android.util.Log.d("SignupActivity", "Response body: $responseBody")

            if (response.isSuccessful) {
                val jsonResponse = JSONObject(responseBody)
                val user = jsonResponse.optJSONObject("user")
                val token = jsonResponse.optJSONObject("session")?.optString("token") ?: ""
                val userName = user?.optString("name") ?: name
                
                SignupResult(true, token, userName, null)
            } else {
                val error = if (responseBody.isEmpty()) {
                    when (response.code) {
                        500 -> "Email already exists or server error"
                        400 -> "Invalid input"
                        else -> "Signup failed: ${response.code}"
                    }
                } else {
                    try {
                        JSONObject(responseBody).optString("message", "Signup failed")
                    } catch (e: Exception) {
                        "Signup failed: ${response.code}"
                    }
                }
                SignupResult(false, null, null, error)
            }
        } catch (e: Exception) {
            android.util.Log.e("SignupActivity", "Network error", e)
            SignupResult(false, null, null, "Network error: ${e.message}")
        }
    }

    data class SignupResult(
        val success: Boolean,
        val token: String?,
        val userName: String?,
        val error: String?
    )
}
