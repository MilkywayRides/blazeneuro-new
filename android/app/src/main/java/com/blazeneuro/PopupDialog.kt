package com.blazeneuro

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.view.LayoutInflater
import android.widget.*
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.bumptech.glide.Glide
import org.json.JSONObject

class PopupDialog(private val context: Context, private val popupData: JSONObject) {
    
    private var player: ExoPlayer? = null
    
    fun show() {
        val dialog = Dialog(context, android.R.style.Theme_Black_NoTitleBar_Fullscreen)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        
        val view = LayoutInflater.from(context).inflate(R.layout.dialog_popup, null)
        val card = view.findViewById<androidx.cardview.widget.CardView>(R.id.popupCard)
        val container = view.findViewById<LinearLayout>(R.id.popupContainer)
        val btnClose = view.findViewById<ImageView>(R.id.btnClose)
        val videoContainer = view.findViewById<FrameLayout>(R.id.videoContainer)
        val playerView = view.findViewById<PlayerView>(R.id.playerView)
        val btnPlayPause = view.findViewById<ImageView>(R.id.btnPlayPause)
        val btnMute = view.findViewById<ImageView>(R.id.btnMute)
        val popupTitle = view.findViewById<TextView>(R.id.popupTitle)
        
        // Set card background based on theme
        val isDarkMode = (context.resources.configuration.uiMode and 
            android.content.res.Configuration.UI_MODE_NIGHT_MASK) == 
            android.content.res.Configuration.UI_MODE_NIGHT_YES
        card.setCardBackgroundColor(if (isDarkMode) Color.parseColor("#1C1C1E") else Color.WHITE)
        
        popupTitle.text = popupData.getString("title")
        
        btnClose.setOnClickListener { 
            player?.release()
            dialog.dismiss() 
        }
        
        val components = popupData.getJSONArray("components")
        var hasVideo = false
        var videoUrl = ""
        
        // Check for video first
        for (i in 0 until components.length()) {
            val comp = components.getJSONObject(i)
            if (comp.getString("type") == "video") {
                hasVideo = true
                videoUrl = comp.getString("content")
                break
            }
        }
        
        if (hasVideo) {
            videoContainer.visibility = android.view.View.VISIBLE
            setupVideo(playerView, videoUrl, btnPlayPause, btnMute)
        }
        
        // Add other components
        for (i in 0 until components.length()) {
            val comp = components.getJSONObject(i)
            if (comp.getString("type") != "video") {
                addComponent(container, comp)
            }
        }
        
        dialog.setContentView(view)
        dialog.setOnDismissListener { player?.release() }
        dialog.show()
    }
    
    private fun setupVideo(playerView: PlayerView, url: String, btnPlayPause: ImageView, btnMute: ImageView) {
        player = ExoPlayer.Builder(context).build()
        playerView.player = player
        playerView.useController = false
        playerView.resizeMode = androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_FIT
        
        val mediaItem = MediaItem.fromUri(Uri.parse(url))
        player?.setMediaItem(mediaItem)
        player?.prepare()
        player?.play()
        
        btnPlayPause.setOnClickListener {
            if (player?.isPlaying == true) {
                player?.pause()
            } else {
                player?.play()
            }
        }
        
        var isMuted = false
        btnMute.setOnClickListener {
            isMuted = !isMuted
            player?.volume = if (isMuted) 0f else 1f
            btnMute.setImageResource(
                if (isMuted) R.drawable.ic_volume_mute 
                else R.drawable.ic_volume_high
            )
        }
        
        player?.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                btnPlayPause.post {
                    btnPlayPause.setImageResource(
                        if (isPlaying) R.drawable.ic_pause_circle 
                        else R.drawable.ic_play_circle
                    )
                }
            }
        })
    }
    
    private fun addComponent(container: LinearLayout, comp: JSONObject) {
        when (comp.getString("type")) {
            "title" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 18f
                tv.setTypeface(null, android.graphics.Typeface.BOLD)
                tv.setPadding(0, 0, 0, 16)
                container.addView(tv)
            }
            "text" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 14f
                tv.setPadding(0, 0, 0, 16)
                container.addView(tv)
            }
            "image" -> {
                val iv = ImageView(context)
                iv.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                iv.setPadding(0, 0, 0, 16)
                Glide.with(context).load(comp.getString("content")).into(iv)
                container.addView(iv)
            }
            "poll" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 16f
                tv.setTypeface(null, android.graphics.Typeface.BOLD)
                tv.setPadding(0, 0, 0, 12)
                container.addView(tv)
                
                val options = comp.getJSONArray("options")
                val radioGroup = RadioGroup(context)
                for (j in 0 until options.length()) {
                    val rb = RadioButton(context)
                    rb.text = options.getString(j)
                    rb.setPadding(16, 12, 16, 12)
                    radioGroup.addView(rb)
                }
                container.addView(radioGroup)
            }
        }
    }
}
