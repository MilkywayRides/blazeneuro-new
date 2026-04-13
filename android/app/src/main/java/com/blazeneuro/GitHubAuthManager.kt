package com.blazeneuro

import android.content.Context
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent

class GitHubAuthManager(private val context: Context) {

    private val GITHUB_CLIENT_ID = "Ov23liq1hd5q3WOJSFK7"
    private val REDIRECT_URI = "https://auth.blazeneuro.com/api/auth/callback/github"
    private val SCOPE = "user:email read:user"

    fun launchGitHubSignIn() {
        val state = generateState()
        saveState(state)
        
        val authUrl = Uri.parse("https://github.com/login/oauth/authorize")
            .buildUpon()
            .appendQueryParameter("client_id", GITHUB_CLIENT_ID)
            .appendQueryParameter("redirect_uri", REDIRECT_URI)
            .appendQueryParameter("scope", SCOPE)
            .appendQueryParameter("state", state)
            .build()

        val customTabsIntent = CustomTabsIntent.Builder()
            .setShowTitle(true)
            .build()

        customTabsIntent.launchUrl(context, authUrl)
    }

    private fun generateState(): String {
        return java.util.UUID.randomUUID().toString().replace("-", "")
    }
    
    private fun saveState(state: String) {
        context.getSharedPreferences("github_auth", Context.MODE_PRIVATE)
            .edit()
            .putString("state", state)
            .apply()
    }
    
    fun getState(): String? {
        return context.getSharedPreferences("github_auth", Context.MODE_PRIVATE)
            .getString("state", null)
    }
}
