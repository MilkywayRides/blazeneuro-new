package com.blazeneuro

import android.app.Activity
import android.app.AlertDialog
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.core.content.FileProvider
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File

object AppUpdateManager {
    private const val TAG = "AppUpdateManager"
    private const val APK_MIME_TYPE = "application/vnd.android.package-archive"

    @Volatile
    private var dialogShowing = false

    @Volatile
    private var lastPromptedVersionCode = -1

    private val httpClient = OkHttpClient.Builder().build()
    private val gson = Gson()

    fun checkForUpdates(activity: Activity, forced: Boolean = false) {
        val repository = BuildConfig.UPDATE_REPOSITORY
        if (repository.isBlank()) {
            Log.d(TAG, "Skipping update check because UPDATE_REPOSITORY is empty")
            return
        }

        activity.lifecycleScope.launch {
            val update = withContext(Dispatchers.IO) { fetchLatestUpdate(repository) }
            if (update == null || activity.isFinishing || activity.isDestroyed) return@launch

            if (!forced && lastPromptedVersionCode == update.versionCode) return@launch
            lastPromptedVersionCode = update.versionCode
            showUpdateDialog(activity, update)
        }
    }

    private fun fetchLatestUpdate(repository: String): AppUpdate? {
        return try {
            val request = Request.Builder()
                .url("https://api.github.com/repos/$repository/releases/latest")
                .header("Accept", "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.w(TAG, "GitHub release check failed: HTTP ${response.code}")
                    return null
                }

                val body = response.body?.string().orEmpty()
                val release = gson.fromJson(body, GitHubRelease::class.java)
                if (release.draft || release.prerelease) return null

                val latestVersionCode = release.versionCode()
                if (latestVersionCode <= BuildConfig.VERSION_CODE) return null

                val apkAsset = release.assets.firstOrNull { asset ->
                    asset.name.endsWith(".apk", ignoreCase = true)
                } ?: return null

                AppUpdate(
                    versionCode = latestVersionCode,
                    versionName = release.versionName(),
                    releaseNotes = release.body.orEmpty(),
                    apkUrl = apkAsset.browserDownloadUrl,
                    apkFileName = apkAsset.name
                )
            }
        } catch (error: Exception) {
            Log.e(TAG, "Unable to check for app updates", error)
            null
        }
    }

    private fun showUpdateDialog(activity: Activity, update: AppUpdate) {
        if (dialogShowing) return
        dialogShowing = true

        val message = buildString {
            append("Version ${update.versionName} is available. Your current version is ${BuildConfig.VERSION_NAME}.\n\n")
            append("Tap Update now to download and install it.")
            val notes = update.releaseNotes.trim()
            if (notes.isNotBlank()) {
                append("\n\nWhat's new:\n")
                append(notes.take(500))
                if (notes.length > 500) append("…")
            }
        }

        AlertDialog.Builder(activity)
            .setTitle("New update available")
            .setMessage(message)
            .setCancelable(false)
            .setPositiveButton("Update now") { _, _ ->
                dialogShowing = false
                downloadAndInstall(activity, update)
            }
            .setNegativeButton("Later") { _, _ ->
                dialogShowing = false
            }
            .setOnDismissListener { dialogShowing = false }
            .show()
    }

    private fun downloadAndInstall(activity: Activity, update: AppUpdate) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !activity.packageManager.canRequestPackageInstalls()) {
            Toast.makeText(activity, "Allow BlazeNeuro to install updates, then try again.", Toast.LENGTH_LONG).show()
            val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                data = Uri.parse("package:${activity.packageName}")
            }
            activity.startActivity(intent)
            return
        }

        Toast.makeText(activity, "Downloading update…", Toast.LENGTH_SHORT).show()
        activity.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apkFile = downloadApk(activity, update)
                withContext(Dispatchers.Main) { installApk(activity, apkFile) }
            } catch (error: Exception) {
                Log.e(TAG, "Update download failed", error)
                withContext(Dispatchers.Main) {
                    fallbackToDownloadManager(activity, update)
                }
            }
        }
    }

    private fun downloadApk(context: Context, update: AppUpdate): File {
        val request = Request.Builder().url(update.apkUrl).build()
        httpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) error("APK download failed: HTTP ${response.code}")
            val updatesDir = File(context.cacheDir, "updates").apply { mkdirs() }
            val apkFile = File(updatesDir, update.apkFileName.sanitizeFileName())
            response.body?.byteStream()?.use { input ->
                apkFile.outputStream().use { output -> input.copyTo(output) }
            } ?: error("APK download response was empty")
            return apkFile
        }
    }

    private fun installApk(activity: Activity, apkFile: File) {
        val apkUri = FileProvider.getUriForFile(
            activity,
            "${activity.packageName}.fileprovider",
            apkFile
        )
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, APK_MIME_TYPE)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            activity.startActivity(intent)
        } catch (error: ActivityNotFoundException) {
            Toast.makeText(activity, "No installer app was found on this device.", Toast.LENGTH_LONG).show()
        }
    }

    private fun fallbackToDownloadManager(activity: Activity, update: AppUpdate) {
        val request = DownloadManager.Request(Uri.parse(update.apkUrl))
            .setTitle("BlazeNeuro ${update.versionName}")
            .setDescription("Downloading app update")
            .setMimeType(APK_MIME_TYPE)
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)

        val downloadManager = activity.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val downloadId = downloadManager.enqueue(request)
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L) != downloadId) return
                val apkUri = downloadManager.getUriForDownloadedFile(downloadId) ?: return
                activity.unregisterReceiver(this)
                activity.startActivity(Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(apkUri, APK_MIME_TYPE)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                })
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            activity.registerReceiver(receiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            activity.registerReceiver(receiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
        }
    }

    private fun GitHubRelease.versionCode(): Int {
        releaseVersionCode?.toIntOrNull()?.let { return it }
        tagName.substringAfterLast("+").toIntOrNull()?.let { return it }
        return Regex("(?:versionCode|code)\\s*[:=]\\s*(\\d+)", RegexOption.IGNORE_CASE)
            .find(body.orEmpty())
            ?.groupValues
            ?.getOrNull(1)
            ?.toIntOrNull()
            ?: -1
    }

    private fun GitHubRelease.versionName(): String {
        return tagName.removePrefix("v").substringBefore("+").ifBlank { tagName }
    }

    private fun String.sanitizeFileName(): String {
        return replace(Regex("[^A-Za-z0-9._-]"), "_")
    }
}

private data class AppUpdate(
    val versionCode: Int,
    val versionName: String,
    val releaseNotes: String,
    val apkUrl: String,
    val apkFileName: String
)

private data class GitHubRelease(
    @SerializedName("tag_name") val tagName: String,
    @SerializedName("name") val name: String?,
    @SerializedName("body") val body: String?,
    @SerializedName("draft") val draft: Boolean,
    @SerializedName("prerelease") val prerelease: Boolean,
    @SerializedName("assets") val assets: List<GitHubReleaseAsset>,
    @SerializedName("version_code") val releaseVersionCode: String? = null
)

private data class GitHubReleaseAsset(
    @SerializedName("name") val name: String,
    @SerializedName("browser_download_url") val browserDownloadUrl: String
)
