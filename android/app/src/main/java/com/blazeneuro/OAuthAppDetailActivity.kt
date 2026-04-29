package com.blazeneuro

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class OAuthAppDetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_oauth_detail)

        val appName = intent.getStringExtra("appName") ?: ""
        val appDesc = intent.getStringExtra("appDesc") ?: "No description"
        val clientId = intent.getStringExtra("clientId") ?: ""
        val redirectUri = intent.getStringExtra("redirectUri") ?: ""

        findViewById<ImageView>(R.id.ivBack).setOnClickListener { finish() }
        findViewById<TextView>(R.id.tvAppName).text = appName
        findViewById<TextView>(R.id.tvAppDesc).text = appDesc
        findViewById<TextView>(R.id.tvClientId).text = clientId
        findViewById<TextView>(R.id.tvRedirectUri).text = redirectUri

        findViewById<ImageView>(R.id.btnCopyClientId).setOnClickListener {
            copyToClipboard("Client ID", clientId)
        }

        findViewById<ImageView>(R.id.btnCopyRedirectUri).setOnClickListener {
            copyToClipboard("Redirect URI", redirectUri)
        }
    }

    private fun copyToClipboard(label: String, text: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText(label, text)
        clipboard.setPrimaryClip(clip)
        Toast.makeText(this, "$label copied", Toast.LENGTH_SHORT).show()
    }
}
