package com.blazeneuro

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Centralized auth API client with persistent cookie management.
 * All auth requests go to https://auth.blazeneuro.com
 */
object AuthApi {
    private const val TAG = "AuthApi"
    const val AUTH_BASE_URL = "https://auth.blazeneuro.com"
    const val SITE_URL = "https://blazeneuro.com"
    private const val PREFS_NAME = "auth"
    private const val KEY_COOKIES = "cookies"
    private const val KEY_TOKEN = "token"
    private const val KEY_USER_NAME = "userName"
    private const val KEY_USER_EMAIL = "userEmail"
    private const val KEY_USER_IMAGE = "userImage"

    private lateinit var prefs: SharedPreferences
    private lateinit var client: OkHttpClient

    fun init(context: Context) {
        if (::prefs.isInitialized) return
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .cookieJar(PersistentCookieJar(prefs))
            .followRedirects(false)
            .build()
    }

    // ---- Auth Methods ----

    data class AuthResult(
        val success: Boolean,
        val token: String? = null,
        val userName: String? = null,
        val userEmail: String? = null,
        val userImage: String? = null,
        val error: String? = null
    )

    data class Blog(
        val id: String,
        val title: String,
        val description: String?,
        val slug: String,
        val createdAt: String,
        val readTime: Int = 5
    )

    data class SearchResult(
        val id: String,
        val title: String,
        val description: String?,
        val slug: String
    )

    suspend fun signInEmail(email: String, password: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("email", email)
                put("password", password)
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$AUTH_BASE_URL/api/auth/sign-in/email")
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build()

            Log.d(TAG, "Sign-in request to: $AUTH_BASE_URL/api/auth/sign-in/email")
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            Log.d(TAG, "Sign-in response: ${response.code} - $responseBody")

            if (response.isSuccessful) {
                val jsonResponse = JSONObject(responseBody)
                val user = jsonResponse.optJSONObject("user")
                val token = jsonResponse.optJSONObject("session")?.optString("token") ?: ""
                val userName = user?.optString("name") ?: "User"
                val userEmail = user?.optString("email") ?: email
                val userImage = user?.optString("image", null)

                saveSession(token, userName, userEmail, userImage)
                AuthResult(true, token, userName, userEmail, userImage)
            } else {
                val error = parseError(responseBody, response.code)
                AuthResult(false, error = error)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Sign-in error", e)
            AuthResult(false, error = "Network error: ${e.message}")
        }
    }

    suspend fun signUpEmail(name: String, email: String, password: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("name", name)
                put("email", email)
                put("password", password)
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$AUTH_BASE_URL/api/auth/sign-up/email")
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build()

            Log.d(TAG, "Sign-up request to: $AUTH_BASE_URL/api/auth/sign-up/email")
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            Log.d(TAG, "Sign-up response: ${response.code} - $responseBody")

            if (response.isSuccessful) {
                val jsonResponse = JSONObject(responseBody)
                val user = jsonResponse.optJSONObject("user")
                val token = jsonResponse.optJSONObject("session")?.optString("token") ?: ""
                val userName = user?.optString("name") ?: name
                val userEmail = user?.optString("email") ?: email
                val userImage = user?.optString("image", null)

                saveSession(token, userName, userEmail, userImage)
                AuthResult(true, token, userName, userEmail, userImage)
            } else {
                val error = parseError(responseBody, response.code)
                AuthResult(false, error = error)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Sign-up error", e)
            AuthResult(false, error = "Network error: ${e.message}")
        }
    }

    suspend fun getSession(): AuthResult = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$AUTH_BASE_URL/api/auth/get-session")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            Log.d(TAG, "Get session response: ${response.code}")

            if (response.isSuccessful && responseBody.isNotEmpty()) {
                val jsonResponse = JSONObject(responseBody)
                val user = jsonResponse.optJSONObject("user")
                val session = jsonResponse.optJSONObject("session")
                if (user != null && session != null) {
                    val token = session.optString("token", "")
                    val userName = user.optString("name", "User")
                    val userEmail = user.optString("email", "")
                    val userImage = user.optString("image", null)
                    saveSession(token, userName, userEmail, userImage)
                    return@withContext AuthResult(true, token, userName, userEmail, userImage)
                }
            }
            AuthResult(false, error = "No valid session")
        } catch (e: Exception) {
            Log.e(TAG, "Get session error", e)
            AuthResult(false, error = "Network error: ${e.message}")
        }
    }

    suspend fun forgotPassword(email: String): AuthResult = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("email", email)
                put("redirectTo", "$AUTH_BASE_URL/reset-password")
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$AUTH_BASE_URL/api/auth/forget-password")
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (response.isSuccessful) {
                AuthResult(true)
            } else {
                AuthResult(false, error = parseError(responseBody, response.code))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Forgot password error", e)
            AuthResult(false, error = "Network error: ${e.message}")
        }
    }

    suspend fun signOut(): Boolean = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$AUTH_BASE_URL/api/auth/sign-out")
                .post("{}".toRequestBody("application/json".toMediaType()))
                .build()
            client.newCall(request).execute()
        } catch (e: Exception) {
            Log.e(TAG, "Sign-out error", e)
        }
        clearSession()
        true
    }

    // ---- Social Auth URLs ----

    fun getGoogleSignInUrl(callbackUrl: String): String {
        return "$AUTH_BASE_URL/api/auth/sign-in/social?provider=google&callbackURL=${java.net.URLEncoder.encode(callbackUrl, "UTF-8")}"
    }

    fun getGithubSignInUrl(callbackUrl: String): String {
        return "$AUTH_BASE_URL/api/auth/sign-in/social?provider=github&callbackURL=${java.net.URLEncoder.encode(callbackUrl, "UTF-8")}"
    }

    // ---- Session Management ----

    fun hasSession(): Boolean {
        return prefs.getString(KEY_TOKEN, null) != null
    }

    fun getSavedUserName(): String {
        return prefs.getString(KEY_USER_NAME, "User") ?: "User"
    }

    fun getSavedUserEmail(): String {
        return prefs.getString(KEY_USER_EMAIL, "") ?: ""
    }

    fun getSavedToken(): String {
        return prefs.getString(KEY_TOKEN, "") ?: ""
    }

    // ---- API Methods ----

    suspend fun getBlogs(limit: Int = 20, offset: Int = 0): List<Blog> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/blogs?limit=$limit&offset=$offset")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            val blogsArray = json.optJSONArray("blogs") ?: return@withContext emptyList()

            (0 until blogsArray.length()).map { i ->
                val blog = blogsArray.getJSONObject(i)
                Blog(
                    id = blog.getString("id"),
                    title = blog.getString("title"),
                    description = blog.optString("description", null),
                    slug = blog.getString("slug"),
                    createdAt = blog.getString("createdAt"),
                    readTime = blog.optInt("readTime", 5)
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get blogs error", e)
            emptyList()
        }
    }

    suspend fun searchBlogs(query: String): List<SearchResult> = withContext(Dispatchers.IO) {
        try {
            val encodedQuery = java.net.URLEncoder.encode(query, "UTF-8")
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/search?q=$encodedQuery")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            val resultsArray = json.optJSONArray("results") ?: return@withContext emptyList()

            (0 until resultsArray.length()).map { i ->
                val result = resultsArray.getJSONObject(i)
                SearchResult(
                    id = result.getString("id"),
                    title = result.getString("title"),
                    description = result.optString("description", null),
                    slug = result.getString("slug")
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Search error", e)
            emptyList()
        }
    }

    private fun saveSession(token: String, userName: String, userEmail: String, userImage: String?) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putString(KEY_USER_NAME, userName)
            putString(KEY_USER_EMAIL, userEmail)
            if (userImage != null) putString(KEY_USER_IMAGE, userImage)
            apply()
        }
    }

    private fun clearSession() {
        prefs.edit().clear().apply()
    }

    // ---- Cookie management for WebView ----

    fun getCookiesForDomain(domain: String): List<Cookie> {
        val url = HttpUrl.Builder().scheme("https").host(domain).build()
        return client.cookieJar.loadForRequest(url)
    }

    // ---- Helpers ----

    private fun parseError(responseBody: String, code: Int): String {
        if (responseBody.isEmpty()) {
            return when (code) {
                401 -> "Invalid credentials"
                409 -> "Account already exists"
                422 -> "Invalid input"
                429 -> "Too many attempts, try again later"
                500 -> "Server error, try again"
                else -> "Request failed (code $code)"
            }
        }
        return try {
            val json = JSONObject(responseBody)
            json.optString("message", null)
                ?: json.optJSONObject("error")?.optString("message", null)
                ?: "Request failed"
        } catch (e: Exception) {
            "Request failed (code $code)"
        }
    }

    // ---- Persistent Cookie Jar ----

    private class PersistentCookieJar(private val prefs: SharedPreferences) : CookieJar {
        private val cookies = mutableMapOf<String, MutableList<Cookie>>()

        init {
            loadFromPrefs()
        }

        override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
            val host = url.host
            val existing = this.cookies.getOrPut(host) { mutableListOf() }
            for (cookie in cookies) {
                existing.removeAll { it.name == cookie.name }
                existing.add(cookie)
            }
            saveToPrefs()
        }

        override fun loadForRequest(url: HttpUrl): List<Cookie> {
            val now = System.currentTimeMillis() / 1000
            val result = mutableListOf<Cookie>()
            for ((_, cookieList) in cookies) {
                for (cookie in cookieList) {
                    if (cookie.expiresAt / 1000 > now && cookie.matches(url)) {
                        result.add(cookie)
                    }
                }
            }
            return result
        }

        private fun saveToPrefs() {
            val serialized = StringBuilder()
            for ((_, cookieList) in cookies) {
                for (cookie in cookieList) {
                    serialized.append(cookie.toString())
                    serialized.append("|||")
                    serialized.append(cookie.domain)
                    serialized.append("|||")
                    serialized.append(cookie.path)
                    serialized.append("|||")
                    serialized.append(cookie.expiresAt)
                    serialized.append("|||")
                    serialized.append(if (cookie.secure) "1" else "0")
                    serialized.append("|||")
                    serialized.append(if (cookie.httpOnly) "1" else "0")
                    serialized.append("\n")
                }
            }
            prefs.edit().putString(KEY_COOKIES, serialized.toString()).apply()
        }

        private fun loadFromPrefs() {
            val serialized = prefs.getString(KEY_COOKIES, "") ?: return
            for (line in serialized.split("\n")) {
                if (line.isBlank()) continue
                try {
                    val parts = line.split("|||")
                    if (parts.size >= 6) {
                        val cookieStr = parts[0]
                        val domain = parts[1]
                        val path = parts[2]
                        val expiresAt = parts[3].toLongOrNull() ?: continue
                        val secure = parts[4] == "1"
                        val httpOnly = parts[5] == "1"

                        val nameValue = cookieStr.split("=", limit = 2)
                        if (nameValue.size == 2) {
                            val builder = Cookie.Builder()
                                .name(nameValue[0].trim())
                                .value(nameValue[1].trim())
                                .domain(domain)
                                .path(path)
                                .expiresAt(expiresAt)
                            if (secure) builder.secure()
                            if (httpOnly) builder.httpOnly()
                            val cookie = builder.build()
                            val existing = cookies.getOrPut(domain) { mutableListOf() }
                            existing.removeAll { it.name == cookie.name }
                            existing.add(cookie)
                        }
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to parse saved cookie", e)
                }
            }
        }

        fun clearAll() {
            cookies.clear()
            prefs.edit().remove(KEY_COOKIES).apply()
        }
    }
}
