package com.blazeneuro

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class NotificationService : Service() {
    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(1, createForegroundNotification())
        startPolling()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "service_channel",
                "Notification Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
    
    private fun createForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, "service_channel")
            .setContentTitle("BlazeNeuro")
            .setContentText("Checking for notifications...")
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
    
    private fun startPolling() {
        serviceScope.launch {
            while (true) {
                com.blazeneuro.NotificationManager.fetchNotificationsFromServer(this@NotificationService)
                delay(5000) // Poll every 5 seconds
            }
        }
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onDestroy() {
        super.onDestroy()
        serviceScope.coroutineContext[Job]?.cancel()
    }
}
