package com.blazeneuro

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

object CommunityApi {
    private val client = OkHttpClient()
    private const val BASE_URL = "https://blazeneuro.com/api/community"

    suspend fun getPosts(): List<CommunityPost> = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$BASE_URL/posts")
            .get()
            .build()

        val response = client.newCall(request).execute()
        val json = JSONArray(response.body?.string() ?: "[]")
        
        (0 until json.length()).map { i ->
            val obj = json.getJSONObject(i)
            val repliesArray = obj.optJSONArray("replies") ?: JSONArray()
            val replies = (0 until repliesArray.length()).map { j ->
                val replyObj = repliesArray.getJSONObject(j)
                CommunityPost(
                    id = replyObj.getString("id"),
                    author = replyObj.optString("userName", "Unknown"),
                    message = replyObj.getString("message"),
                    time = formatTime(replyObj.getString("createdAt")),
                    likes = replyObj.getInt("likes"),
                    dislikes = replyObj.getInt("dislikes"),
                    isReply = true
                )
            }.toMutableList()
            
            CommunityPost(
                id = obj.getString("id"),
                author = obj.optString("userName", "Unknown"),
                message = obj.getString("message"),
                time = formatTime(obj.getString("createdAt")),
                likes = obj.getInt("likes"),
                dislikes = obj.getInt("dislikes"),
                replies = replies
            )
        }
    }

    suspend fun createPost(userId: String, message: String, replyToId: String? = null): CommunityPost? = withContext(Dispatchers.IO) {
        val json = JSONObject().apply {
            put("userId", userId)
            put("message", message)
            if (replyToId != null) put("replyToId", replyToId)
        }

        val request = Request.Builder()
            .url("$BASE_URL/posts")
            .post(json.toString().toRequestBody("application/json".toMediaType()))
            .build()

        try {
            val response = client.newCall(request).execute()
            val obj = JSONObject(response.body?.string() ?: "{}")
            CommunityPost(
                id = obj.getString("id"),
                author = obj.optString("userName", "Unknown"),
                message = obj.getString("message"),
                time = formatTime(obj.getString("createdAt")),
                likes = obj.getInt("likes"),
                dislikes = obj.getInt("dislikes"),
                isReply = replyToId != null
            )
        } catch (e: Exception) {
            android.util.Log.e("CommunityApi", "Error creating post", e)
            null
        }
    }

    suspend fun likePost(postId: String, action: String): Boolean = withContext(Dispatchers.IO) {
        val json = JSONObject().apply {
            put("action", action)
        }

        val request = Request.Builder()
            .url("$BASE_URL/posts/$postId")
            .post(json.toString().toRequestBody("application/json".toMediaType()))
            .build()

        try {
            val response = client.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            android.util.Log.e("CommunityApi", "Error liking post", e)
            false
        }
    }

    private fun formatTime(timestamp: String): String {
        return try {
            val time = java.time.Instant.parse(timestamp)
            val now = java.time.Instant.now()
            val diff = java.time.Duration.between(time, now)
            
            when {
                diff.toMinutes() < 1 -> "Just now"
                diff.toMinutes() < 60 -> "${diff.toMinutes()}m ago"
                diff.toHours() < 24 -> "${diff.toHours()}h ago"
                diff.toDays() < 7 -> "${diff.toDays()}d ago"
                else -> "${diff.toDays() / 7}w ago"
            }
        } catch (e: Exception) {
            "Recently"
        }
    }
}
