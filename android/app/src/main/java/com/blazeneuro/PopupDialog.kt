package com.blazeneuro

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.view.LayoutInflater
import android.widget.*
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.bumptech.glide.Glide
import org.json.JSONObject

class PopupDialog(private val context: Context, private val popupData: JSONObject) {
    
    private var player: ExoPlayer? = null
    
    fun show() {
        val dialog = Dialog(context, android.R.style.Theme_Black_NoTitleBar_Fullscreen)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.decorView?.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
        dialog.window?.statusBarColor = Color.TRANSPARENT
        
        val view = LayoutInflater.from(context).inflate(R.layout.dialog_popup, null)
        val thumbnailContainer = view.findViewById<FrameLayout>(R.id.thumbnailContainer)
        val videoPlayerContainer = view.findViewById<FrameLayout>(R.id.videoPlayerContainer)
        val playerView = view.findViewById<PlayerView>(R.id.playerView)
        val btnPlay = view.findViewById<ImageView>(R.id.btnPlay)
        val btnClose = view.findViewById<ImageView>(R.id.btnClose)
        val popupTitle = view.findViewById<TextView>(R.id.popupTitle)
        val popupDescription = view.findViewById<TextView>(R.id.popupDescription)
        
        val titleText = popupData.getString("title")
        val spannableTitle = SpannableString("# $titleText")
        spannableTitle.setSpan(
            ForegroundColorSpan(Color.parseColor("#6366f1")),
            0, 1,
            android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )
        spannableTitle.setSpan(
            ForegroundColorSpan(Color.parseColor("#EBFFFFFF")),
            1, spannableTitle.length,
            android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )
        popupTitle.text = spannableTitle
        
        val components = popupData.getJSONArray("components")
        var videoUrl = ""
        
        for (i in 0 until components.length()) {
            val comp = components.getJSONObject(i)
            if (comp.getString("type") == "video") {
                videoUrl = comp.getString("content")
                break
            }
        }
        
        if (videoUrl.isNotEmpty()) {
            player = ExoPlayer.Builder(context).build()
            playerView.player = player
            playerView.useController = true
            
            val mediaItem = MediaItem.fromUri(Uri.parse(videoUrl))
            player?.setMediaItem(mediaItem)
            player?.prepare()
            
            btnPlay.setOnClickListener {
                thumbnailContainer.visibility = android.view.View.GONE
                videoPlayerContainer.visibility = android.view.View.VISIBLE
                player?.play()
            }
            
            btnClose.setOnClickListener {
                player?.pause()
                player?.seekTo(0)
                videoPlayerContainer.visibility = android.view.View.GONE
                thumbnailContainer.visibility = android.view.View.VISIBLE
            }
        } else {
            btnClose.setOnClickListener {
                player?.release()
                dialog.dismiss()
            }
        }
        
        dialog.setContentView(view)
        dialog.setOnDismissListener { player?.release() }
        dialog.show()
    }
}
