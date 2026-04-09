package com.blazeneuro

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class HomeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        val prefs = getSharedPreferences("auth", MODE_PRIVATE)
        val userName = prefs.getString("userName", "User")

        findViewById<TextView>(R.id.tvUserName).text = userName

        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            prefs.edit().clear().apply()
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }
    }
}
