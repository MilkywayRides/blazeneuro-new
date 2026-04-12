package com.blazeneuro

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import org.json.JSONObject

data class AppNotification(
    val id: String,
    val type: String,
    val fromUser: String,
    val message: String,
    val postId: String,
    val timestamp: Long,
    val read: Boolean = false,
    val link: String? = null
)

object NotificationManager {
    private lateinit var prefs: SharedPreferences
    private var listeners = mutableListOf<() -> Unit>()
    private const val CHANNEL_ID = "blazeneuro_notifications"
    
    fun init(context: Context) {
        prefs = context.getSharedPreferences("notifications", Context.MODE_PRIVATE)
        createNotificationChannel(context)
    }
    
    private fun createNotificationChannel(context: Context) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val name = "BlazeNeuro Notifications"
            val descriptionText = "Notifications from BlazeNeuro"
            val importance = android.app.NotificationManager.IMPORTANCE_DEFAULT
            val channel = android.app.NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    fun addNotification(notification: AppNotification) {
        val notifications = getNotifications().toMutableList()
        notifications.add(0, notification)
        saveNotifications(notifications)
        notifyListeners()
    }
    
    fun showSystemNotification(context: Context, notification: AppNotification) {
        val intent = if (notification.link != null) {
            Intent(Intent.ACTION_VIEW, Uri.parse(notification.link))
        } else {
            Intent(context, HomeActivity::class.java)
        }
        
        val pendingIntent = android.app.PendingIntent.getActivity(
            context, 
            notification.id.hashCode(), 
            intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(notification.fromUser)
            .setContentText(notification.message)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
        
        with(NotificationManagerCompat.from(context)) {
            if (android.app.ActivityCompat.checkSelfPermission(
                    context,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) == android.content.pm.PackageManager.PERMISSION_GRANTED
            ) {
                notify(notification.id.hashCode(), builder.build())
            }
        }
    }
    
    fun getNotifications(): List<AppNotification> {
        val json = prefs.getString("list", "[]") ?: "[]"
        val array = JSONArray(json)
        return (0 until array.length()).map { i ->
            val obj = array.getJSONObject(i)
            AppNotification(
                id = obj.getString("id"),
                type = obj.getString("type"),
                fromUser = obj.getString("fromUser"),
                message = obj.getString("message"),
                postId = obj.optString("postId", ""),
                timestamp = obj.getLong("timestamp"),
                read = obj.optBoolean("read", false),
                link = obj.optString("link", null)
            )
        }
    }
    
    fun markAsRead(id: String) {
        val notifications = getNotifications().map {
            if (it.id == id) it.copy(read = true) else it
        }
        saveNotifications(notifications)
        notifyListeners()
    }
    
    fun clearAll() {
        prefs.edit().remove("list").apply()
        notifyListeners()
    }
    
    fun getUnreadCount(): Int = getNotifications().count { !it.read }
    
    fun addListener(listener: () -> Unit) {
        listeners.add(listener)
    }
    
    fun removeListener(listener: () -> Unit) {
        listeners.remove(listener)
    }
    
    private fun saveNotifications(notifications: List<AppNotification>) {
        val array = JSONArray()
        notifications.forEach { notif ->
            array.put(JSONObject().apply {
                put("id", notif.id)
                put("type", notif.type)
                put("fromUser", notif.fromUser)
                put("message", notif.message)
                put("postId", notif.postId)
                put("timestamp", notif.timestamp)
                put("read", notif.read)
                if (notif.link != null) put("link", notif.link)
            })
        }
        prefs.edit().putString("list", array.toString()).apply()
    }
    
    private fun notifyListeners() {
        listeners.forEach { it() }
    }
    
    fun extractMentions(text: String): List<String> {
        val regex = "@(\\w+)".toRegex()
        return regex.findAll(text).map { it.groupValues[1] }.toList()
    }
    
    suspend fun fetchNotificationsFromServer(context: Context) {
        try {
            val url = "${AuthApi.SITE_URL}/api/mobile/notifications"
            android.util.Log.d("NotificationManager", "Fetching from: $url")
            val connection = java.net.URL(url).openConnection() as java.net.HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            
            val responseCode = connection.responseCode
            android.util.Log.d("NotificationManager", "Response code: $responseCode")
            
            if (responseCode == 200) {
                val response = connection.inputStream.bufferedReader().readText()
                android.util.Log.d("NotificationManager", "Response: $response")
                val array = JSONArray(response)
                android.util.Log.d("NotificationManager", "Found ${array.length()} notifications")
                
                val serverNotifications = (0 until array.length()).map { i ->
                    val obj = array.getJSONObject(i)
                    val description = obj.optString("description", "")
                    val parts = description.split("|", limit = 2)
                    val message = parts[0]
                    val link = if (parts.size > 1) parts[1] else null
                    
                    AppNotification(
                        id = obj.getString("id"),
                        type = obj.optString("type", "info"),
                        fromUser = obj.optString("title", "System"),
                        message = message,
                        postId = "",
                        timestamp = System.currentTimeMillis(),
                        read = obj.optBoolean("read", false),
                        link = link
                    )
                }
                
                val existing = getNotifications()
                val newNotifs = serverNotifications.filter { server ->
                    existing.none { it.id == server.id }
                }
                
                android.util.Log.d("NotificationManager", "New notifications: ${newNotifs.size}")
                
                if (newNotifs.isNotEmpty()) {
                    val updated = newNotifs + existing
                    saveNotifications(updated)
                    notifyListeners()
                    
                    newNotifs.forEach { notif ->
                        android.util.Log.d("NotificationManager", "Showing notification: ${notif.fromUser} - ${notif.message}")
                        showSystemNotification(context, notif)
                    }
                }
            } else {
                android.util.Log.e("NotificationManager", "HTTP error: $responseCode")
            }
        } catch (e: Exception) {
            android.util.Log.e("NotificationManager", "Fetch error", e)
        }
    }
}
