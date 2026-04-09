package com.blazeneuro

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val prefs = getSharedPreferences("auth", MODE_PRIVATE)
        val token = prefs.getString("token", null)

        if (token != null) {
            startActivity(Intent(this, HomeActivity::class.java))
            finish()
            return
        }

        findViewById<android.widget.Button>(R.id.btnLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<android.widget.Button>(R.id.btnSignup).setOnClickListener {
            // TODO: Implement signup
        }
    }
}
