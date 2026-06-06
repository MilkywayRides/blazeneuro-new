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
import org.json.JSONArray
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
    private const val KEY_USER_ID = "userId"
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
        val readTime: Int = 5,
        val coverImage: String?,
        val excerpt: String = "",
        val authorName: String = "",
        val authorImage: String? = null,
        val likeCount: Int = 0,
        val dislikeCount: Int = 0,
        val updatedAt: Long = 0L
    )

    data class BlogDetail(
        val id: String,
        val title: String,
        val content: String,
        val authorId: String,
        val authorName: String?,
        val authorImage: String?,
        val createdAt: String,
        val updatedAt: String,
        val likeCount: Int,
        val dislikeCount: Int
    )

    data class SearchResult(
        val id: String,
        val title: String,
        val description: String?,
        val slug: String
    )

    data class Course(
        val id: String,
        val title: String,
        val type: String,
        val pageCount: Int,
        val coverImage: String? = null
    )

    data class CoursePage(
        val id: String,
        val title: String,
        val contentType: String,
        val body: String?,
        val videoUrl: String?,
        val order: Int,
        val completed: Boolean = false,
        val likeCount: Int = 0,
        val dislikeCount: Int = 0,
        val userReaction: Boolean? = null
    )

    data class Publisher(
        val id: String,
        val name: String,
        val image: String?
    )

    data class CourseDetail(
        val id: String,
        val title: String,
        val type: String,
        val publisher: Publisher?,
        val isFollowing: Boolean = false,
        val pages: List<CoursePage>
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
                val userId = user?.optString("id")
                val userName = user?.optString("name") ?: "User"
                val userEmail = user?.optString("email") ?: email
                val userImage = user?.optString("image", null)

                saveSession(token, userName, userEmail, userImage, userId)
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
                val userId = user?.optString("id")
                val userName = user?.optString("name") ?: name
                val userEmail = user?.optString("email") ?: email
                val userImage = user?.optString("image", null)

                saveSession(token, userName, userEmail, userImage, userId)
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
            // First check if we have local session data
            val localToken = prefs.getString(KEY_TOKEN, null)
            val localUserId = prefs.getString(KEY_USER_ID, null)
            val localUserName = prefs.getString(KEY_USER_NAME, null)
            val localUserEmail = prefs.getString(KEY_USER_EMAIL, null)
            
            Log.d(TAG, "getSession - local data exists: token=${localToken != null}, userId=${localUserId != null}")
            
            // If we have local session, trust it (for social auth)
            if (localToken != null && localUserId != null && localUserName != null && localUserEmail != null) {
                Log.d(TAG, "Using local session data")
                return@withContext AuthResult(true, localToken, localUserName, localUserEmail, null)
            }
            
            // Otherwise verify with backend
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
                    val userId = user.optString("id")
                    val userName = user.optString("name", "User")
                    val userEmail = user.optString("email", "")
                    val userImage = user.optString("image", null)
                    saveSession(token, userName, userEmail, userImage, userId)
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
        val token = prefs.getString(KEY_TOKEN, null)
        val userId = prefs.getString(KEY_USER_ID, null)
        Log.d(TAG, "hasSession check - token: ${token != null}, userId: ${userId != null}")
        return token != null && userId != null
    }

    fun getSavedUserName(): String {
        return prefs.getString(KEY_USER_NAME, "User") ?: "User"
    }

    fun getSavedUserEmail(): String {
        return prefs.getString(KEY_USER_EMAIL, "") ?: ""
    }
    
    fun getSavedUserId(): String? {
        return prefs.getString(KEY_USER_ID, null)
    }

    fun getSavedToken(): String {
        return prefs.getString(KEY_TOKEN, "") ?: ""
    }

    // ---- API Methods ----
    
    suspend fun getTopBlogs(): List<Blog> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/blogs/top")
                .get()
                .build()
            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            val blogsArray = json.optJSONArray("blogs") ?: return@withContext emptyList()
            
            (0 until blogsArray.length()).map { i ->
                val blogObj = blogsArray.getJSONObject(i)
                Blog(
                    id = blogObj.getString("id"),
                    slug = blogObj.getString("slug"),
                    title = blogObj.getString("title"),
                    description = blogObj.optString("excerpt", ""),
                    excerpt = blogObj.optString("excerpt", ""),
                    coverImage = blogObj.optString("coverImage"),
                    authorName = blogObj.optString("authorName", "Anonymous"),
                    authorImage = blogObj.optString("authorImage"),
                    likeCount = blogObj.optInt("likeCount", 0),
                    dislikeCount = 0,
                    createdAt = "",
                    updatedAt = 0L
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "getTopBlogs error", e)
            emptyList()
        }
    }

    suspend fun getBlogs(limit: Int = 20, offset: Int = 0): List<Blog> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/blogs?limit=$limit&offset=$offset")
                .get()
                .build()

            Log.d(TAG, "Fetching blogs from: $SITE_URL/api/mobile/blogs")
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: "{}"
            Log.d(TAG, "Blogs response: ${response.code} - $responseBody")

            if (!response.isSuccessful) {
                Log.e(TAG, "Blogs API failed: ${response.code}")
                return@withContext emptyList()
            }

            val json = JSONObject(responseBody)
            val blogsArray = json.optJSONArray("blogs") ?: return@withContext emptyList()

            (0 until blogsArray.length()).map { i ->
                val blog = blogsArray.getJSONObject(i)
                Blog(
                    id = blog.getString("id"),
                    title = blog.getString("title"),
                    description = blog.optString("description", null),
                    slug = blog.getString("slug"),
                    createdAt = blog.getString("createdAt"),
                    readTime = blog.optInt("readTime", 5),
                    coverImage = blog.optString("coverImage").takeIf { it.isNotEmpty() }
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get blogs error", e)
            emptyList()
        }
    }

    suspend fun getOAuthApps(): List<OAuthApp> = withContext(Dispatchers.IO) {
        try {
            val userId = getSavedUserId()
            if (userId == null) {
                Log.e(TAG, "No user ID found")
                return@withContext emptyList()
            }

            val request = Request.Builder()
                .url("$SITE_URL/api/oauth/apps?userId=$userId")
                .get()
                .build()

            Log.d(TAG, "Fetching OAuth apps for user: $userId")
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: "[]"
            Log.d(TAG, "OAuth response: ${response.code} - $responseBody")

            if (!response.isSuccessful) {
                Log.e(TAG, "OAuth apps API failed: ${response.code}")
                return@withContext emptyList()
            }

            val jsonArray = JSONArray(responseBody)
            (0 until jsonArray.length()).map { i ->
                val app = jsonArray.getJSONObject(i)
                OAuthApp(
                    id = app.getString("id"),
                    name = app.getString("name"),
                    description = app.optString("description", null),
                    clientId = app.getString("clientId"),
                    redirectUri = app.getString("redirectUri"),
                    createdAt = app.getString("createdAt")
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get OAuth apps error", e)
            emptyList()
        }
    }

    suspend fun createOAuthApp(name: String, description: String, homepageUrl: String, callbackUrl: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val userId = getSavedUserId()
            if (userId == null) {
                Log.e(TAG, "No user ID found")
                return@withContext false
            }

            val json = JSONObject().apply {
                put("userId", userId)
                put("name", name)
                put("description", description)
                put("homepageUrl", homepageUrl)
                put("callbackUrl", callbackUrl)
            }

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$SITE_URL/api/oauth/apps")
                .post(body)
                .build()

            Log.d(TAG, "Creating OAuth app: $name")
            val response = client.newCall(request).execute()
            Log.d(TAG, "Create OAuth response: ${response.code}")

            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Create OAuth app error", e)
            false
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

    suspend fun getTrendingSearches(): List<String> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/search?trending=true")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            val trendingArray = json.optJSONArray("trending") ?: return@withContext emptyList()

            (0 until trendingArray.length()).map { i ->
                val item = trendingArray.getJSONObject(i)
                item.getString("query")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Trending error", e)
            emptyList()
        }
    }

    suspend fun getBlogDetail(slug: String): BlogDetail? = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/blogs/$slug")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            val blog = json.optJSONObject("blog") ?: return@withContext null
            val author = json.optJSONObject("author")
            val feedback = json.optJSONObject("feedback")
            
            BlogDetail(
                id = blog.getString("id"),
                title = blog.getString("title"),
                content = blog.getString("content"),
                authorId = blog.getString("authorId"),
                authorName = author?.optString("name"),
                authorImage = author?.optString("image"),
                createdAt = blog.getString("createdAt"),
                updatedAt = blog.getString("updatedAt"),
                likeCount = feedback?.optInt("likes") ?: 0,
                dislikeCount = feedback?.optInt("dislikes") ?: 0
            )
        } catch (e: Exception) {
            Log.e(TAG, "Get blog detail error", e)
            null
        }
    }

    private fun saveSession(token: String, userName: String, userEmail: String, userImage: String?, userId: String? = null) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putString(KEY_USER_NAME, userName)
            putString(KEY_USER_EMAIL, userEmail)
            if (userImage != null) putString(KEY_USER_IMAGE, userImage)
            if (userId != null) putString(KEY_USER_ID, userId)
            apply()
        }
        Log.d(TAG, "Session saved: token=$token, user=$userName, email=$userEmail, userId=$userId")
    }
    
    fun saveSessionFromGoogle(context: Context, token: String, userName: String, userEmail: String, userImage: String?, userId: String?) {
        init(context)
        saveSession(token, userName, userEmail, userImage, userId)
    }

    private fun clearSession() {
        prefs.edit().clear().apply()
    }

    suspend fun submitBlogFeedback(blogId: String, liked: Boolean): Boolean = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("liked", liked)
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            val url = "$SITE_URL/api/mobile/blogs/$blogId/feedback"
            Log.d(TAG, "submitBlogFeedback: POST $url with body: ${json.toString()}")
            val request = Request.Builder()
                .url(url)
                .post(body)
                .build()
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            Log.d(TAG, "submitBlogFeedback: status=${response.code}, body=$responseBody")
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "submitBlogFeedback error", e)
            false
        }
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
    
    // ---- Chat API ----
    
    suspend fun getChatMessages(limit: Int = 50, before: String? = null): List<ChatMessage> = withContext(Dispatchers.IO) {
        try {
            val url = "$SITE_URL/api/mobile/chat?limit=$limit${if (before != null) "&before=$before" else ""}"
            val request = Request.Builder().url(url).get().build()
            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            val messagesArray = json.optJSONArray("messages") ?: return@withContext emptyList()
            
            (0 until messagesArray.length()).map { i ->
                val msg = messagesArray.getJSONObject(i)
                ChatMessage(
                    id = msg.getString("id"),
                    userId = msg.getString("userId"),
                    userName = msg.optString("userName", "Unknown"),
                    userImage = msg.optString("userImage"),
                    content = msg.getString("content"),
                    imageUrl = msg.optString("imageUrl"),
                    replyToId = msg.optString("replyToId"),
                    createdAt = msg.getString("createdAt")
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "getChatMessages error", e)
            emptyList()
        }
    }
    
    suspend fun sendChatMessage(content: String, imageUrl: String?, replyToId: String?, mentions: List<String>): Boolean = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("content", content)
                if (imageUrl != null) put("imageUrl", imageUrl)
                if (replyToId != null) put("replyToId", replyToId)
                if (mentions.isNotEmpty()) put("mentions", JSONArray(mentions))
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/chat")
                .post(body)
                .build()
            val response = client.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "sendChatMessage error", e)
            false
        }
    }
    
    suspend fun deleteChatMessage(messageId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/mobile/chat/$messageId")
                .delete()
                .build()
            val response = client.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "deleteChatMessage error", e)
            false
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

    // ---- Course API Methods ----

    suspend fun getCourses(): List<Course> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/courses")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: return@withContext emptyList()

            if (!response.isSuccessful) {
                Log.e(TAG, "Get courses failed: ${response.code}")
                return@withContext emptyList()
            }

            val jsonArray = JSONArray(body)
            val courses = mutableListOf<Course>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                courses.add(Course(
                    id = obj.getString("id"),
                    title = obj.getString("title"),
                    type = obj.getString("type"),
                    pageCount = obj.getInt("pageCount"),
                    coverImage = obj.optString("coverImage").takeIf { it.isNotEmpty() }
                ))
            }
            courses
        } catch (e: Exception) {
            Log.e(TAG, "Get courses error", e)
            emptyList()
        }
    }

    suspend fun getCourseDetail(courseId: String): CourseDetail? = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$SITE_URL/api/courses/$courseId")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: return@withContext null

            if (!response.isSuccessful) {
                Log.e(TAG, "Get course detail failed: ${response.code}")
                return@withContext null
            }

            val obj = JSONObject(body)
            val pagesArray = obj.getJSONArray("pages")
            val pages = mutableListOf<CoursePage>()
            for (i in 0 until pagesArray.length()) {
                val pageObj = pagesArray.getJSONObject(i)
                pages.add(CoursePage(
                    id = pageObj.getString("id"),
                    title = pageObj.getString("title"),
                    contentType = pageObj.getString("contentType"),
                    body = pageObj.optString("body"),
                    videoUrl = pageObj.optString("videoUrl"),
                    order = pageObj.getInt("order"),
                    completed = pageObj.optBoolean("completed", false),
                    likeCount = pageObj.optInt("likeCount", 0),
                    dislikeCount = pageObj.optInt("dislikeCount", 0),
                    userReaction = if (pageObj.has("userReaction") && !pageObj.isNull("userReaction")) 
                        pageObj.getBoolean("userReaction") else null
                ))
            }

            val publisher = if (obj.has("publisher") && !obj.isNull("publisher")) {
                val pubObj = obj.getJSONObject("publisher")
                Publisher(
                    id = pubObj.getString("id"),
                    name = pubObj.getString("name"),
                    image = if (pubObj.has("image") && !pubObj.isNull("image")) 
                        pubObj.getString("image") else null
                )
            } else null

            CourseDetail(
                id = obj.getString("id"),
                title = obj.getString("title"),
                type = obj.getString("type"),
                publisher = publisher,
                isFollowing = obj.optBoolean("isFollowing", false),
                pages = pages
            )
        } catch (e: Exception) {
            Log.e(TAG, "Get course detail error", e)
            null
        }
    }

    suspend fun markPageComplete(courseId: String, pageId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("pageId", pageId)
                put("completed", true)
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$SITE_URL/api/courses/$courseId/progress")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Mark page complete error", e)
            false
        }
    }

    suspend fun reactToPage(pageId: String, liked: Boolean): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "reactToPage: pageId=$pageId, liked=$liked")
            val json = JSONObject().apply {
                put("pageId", pageId)
                put("liked", liked)
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            
            val token = prefs.getString(KEY_TOKEN, null)
            val requestBuilder = Request.Builder()
                .url("$SITE_URL/api/courses/reactions")
                .post(body)
            
            if (token != null) {
                requestBuilder.addHeader("Cookie", "better-auth.session_token=$token")
            }
            
            val request = requestBuilder.build()
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            Log.d(TAG, "reactToPage response: ${response.code}, body=$responseBody")
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "React to page error", e)
            false
        }
    }

    suspend fun removeReaction(pageId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "removeReaction: pageId=$pageId")
            val json = JSONObject().apply {
                put("pageId", pageId)
            }
            val body = json.toString().toRequestBody("application/json".toMediaType())
            
            val token = prefs.getString(KEY_TOKEN, null)
            val requestBuilder = Request.Builder()
                .url("$SITE_URL/api/courses/reactions")
                .delete(body)
            
            if (token != null) {
                requestBuilder.addHeader("Cookie", "better-auth.session_token=$token")
            }
            
            val request = requestBuilder.build()
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            Log.d(TAG, "removeReaction response: ${response.code}, body=$responseBody")
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Remove reaction error", e)
            false
        }
    }

    suspend fun followPublisher(courseId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "followPublisher: courseId=$courseId")
            
            val token = prefs.getString(KEY_TOKEN, null)
            val requestBuilder = Request.Builder()
                .url("$SITE_URL/api/courses/$courseId/follow")
                .post("".toRequestBody())
            
            if (token != null) {
                requestBuilder.addHeader("Cookie", "better-auth.session_token=$token")
            }
            
            val request = requestBuilder.build()
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            Log.d(TAG, "followPublisher response: ${response.code}, body=$responseBody")
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Follow error", e)
            false
        }
    }

    suspend fun unfollowPublisher(courseId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "unfollowPublisher: courseId=$courseId")
            
            val token = prefs.getString(KEY_TOKEN, null)
            val requestBuilder = Request.Builder()
                .url("$SITE_URL/api/courses/$courseId/follow")
                .delete()
            
            if (token != null) {
                requestBuilder.addHeader("Cookie", "better-auth.session_token=$token")
            }
            
            val request = requestBuilder.build()
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            Log.d(TAG, "unfollowPublisher response: ${response.code}, body=$responseBody")
            response.isSuccessful
        } catch (e: Exception) {
            Log.e(TAG, "Unfollow error", e)
            false
        }
    }
}
