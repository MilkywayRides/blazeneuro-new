package com.blazeneuro

import android.content.Intent
import android.os.Bundle
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

class LoginActivity : AppCompatActivity() {
    private val client = OkHttpClient()
    private val authUrl = "https://auth.blazeneuro.com"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val tvError = findViewById<TextView>(R.id.tvError)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()

            if (email.isEmpty() || password.isEmpty()) {
                tvError.text = "Please fill all fields"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            btnLogin.isEnabled = false
            tvError.visibility = View.GONE

            lifecycleScope.launch {
                try {
                    val result = login(email, password)
                    if (result.success) {
                        val prefs = getSharedPreferences("auth", MODE_PRIVATE)
                        prefs.edit().apply {
                            putString("token", result.token)
                            putString("userName", result.userName)
                            apply()
                        }
                        startActivity(Intent(this@LoginActivity, HomeActivity::class.java))
                        finish()
                    } else {
                        tvError.text = result.error
                        tvError.visibility = View.VISIBLE
                    }
                } catch (e: Exception) {
                    tvError.text = "Login failed: ${e.message}"
                    tvError.visibility = View.VISIBLE
                } finally {
                    btnLogin.isEnabled = true
                }
            }
        }
    }

    private suspend fun login(email: String, password: String): LoginResult = withContext(Dispatchers.IO) {
        val json = JSONObject().apply {
            put("email", email)
            put("password", password)
        }

        val body = json.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url("$authUrl/api/auth/sign-in/email")
            .post(body)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: ""

        if (response.isSuccessful) {
            val jsonResponse = JSONObject(responseBody)
            val user = jsonResponse.optJSONObject("user")
            val token = jsonResponse.optJSONObject("session")?.optString("token") ?: ""
            val userName = user?.optString("name") ?: "User"
            
            LoginResult(true, token, userName, null)
        } else {
            val error = try {
                JSONObject(responseBody).optString("message", "Login failed")
            } catch (e: Exception) {
                "Login failed"
            }
            LoginResult(false, null, null, error)
        }
    }

    data class LoginResult(
        val success: Boolean,
        val token: String?,
        val userName: String?,
        val error: String?
    )
}
