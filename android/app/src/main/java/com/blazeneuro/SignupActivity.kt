package com.blazeneuro

import android.content.Intent
import android.net.Uri
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

class SignupActivity : AppCompatActivity() {
    private val client = OkHttpClient()
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
        val json = JSONObject().apply {
            put("name", name)
            put("email", email)
            put("password", password)
        }

        val body = json.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url("$authUrl/api/auth/sign-up/email")
            .post(body)
            .build()

        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: ""

        if (response.isSuccessful) {
            val jsonResponse = JSONObject(responseBody)
            val user = jsonResponse.optJSONObject("user")
            val token = jsonResponse.optJSONObject("session")?.optString("token") ?: ""
            val userName = user?.optString("name") ?: name
            
            SignupResult(true, token, userName, null)
        } else {
            val error = try {
                JSONObject(responseBody).optString("message", "Signup failed")
            } catch (e: Exception) {
                "Signup failed"
            }
            SignupResult(false, null, null, error)
        }
    }

    data class SignupResult(
        val success: Boolean,
        val token: String?,
        val userName: String?,
        val error: String?
    )
}
