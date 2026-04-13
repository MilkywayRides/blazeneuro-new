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
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.bumptech.glide.Glide
import org.json.JSONObject

class PopupDialog(private val context: Context, private val popupData: JSONObject) {
    
    private var player: ExoPlayer? = null
    
    fun show() {
        val dialog = Dialog(context, android.R.style.Theme_Translucent_NoTitleBar_Fullscreen)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.decorView?.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
        dialog.window?.statusBarColor = Color.TRANSPARENT
        
        // Enable blur effect (API 31+)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            dialog.window?.setBackgroundBlurRadius(80)
        }
        
        val view = LayoutInflater.from(context).inflate(R.layout.dialog_popup, null)
        val container = view.findViewById<LinearLayout>(R.id.popupContainer)
        val btnClose = view.findViewById<ImageView>(R.id.btnClose)
        val videoContainer = view.findViewById<FrameLayout>(R.id.videoContainer)
        val playerView = view.findViewById<PlayerView>(R.id.playerView)
        val btnPlayPause = view.findViewById<ImageView>(R.id.btnPlayPause)
        val btnMute = view.findViewById<ImageView>(R.id.btnMute)
        val popupTitle = view.findViewById<TextView>(R.id.popupTitle)
        val metadataText = view.findViewById<TextView>(R.id.metadataText)
        
        // Set title with indigo # prefix
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
        
        btnClose.setOnClickListener { 
            player?.release()
            dialog.dismiss() 
        }
        
        val components = popupData.getJSONArray("components")
        var hasVideo = false
        var videoUrl = ""
        
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
            setupVideo(playerView, videoUrl, btnPlayPause, btnMute, metadataText)
        }
        
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
    
    private fun setupVideo(playerView: PlayerView, url: String, btnPlayPause: ImageView, btnMute: ImageView, metadataText: TextView) {
        player = ExoPlayer.Builder(context).build()
        playerView.player = player
        playerView.useController = false
        playerView.resizeMode = androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_ZOOM
        
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
            
            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_READY) {
                    val duration = player?.duration ?: 0
                    val minutes = (duration / 1000 / 60).toInt()
                    val seconds = (duration / 1000 % 60).toInt()
                    metadataText.text = "Video · $minutes min $seconds sec"
                } else if (state == Player.STATE_ENDED) {
                    player?.seekTo(0)
                    player?.play()
                }
            }
        })
    }
    
    private fun addComponent(container: LinearLayout, comp: JSONObject) {
        when (comp.getString("type")) {
            "title" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 16f
                tv.setTextColor(Color.parseColor("#EBFFFFFF"))
                tv.setTypeface(null, android.graphics.Typeface.BOLD)
                tv.setPadding(0, 0, 0, 12)
                container.addView(tv)
            }
            "text" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 13f
                tv.setTextColor(Color.parseColor("#61FFFFFF"))
                tv.setPadding(0, 0, 0, 12)
                container.addView(tv)
            }
            "image" -> {
                val iv = ImageView(context)
                iv.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                iv.setPadding(0, 0, 0, 12)
                Glide.with(context).load(comp.getString("content")).into(iv)
                container.addView(iv)
            }
            "poll" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 15f
                tv.setTextColor(Color.parseColor("#EBFFFFFF"))
                tv.setTypeface(null, android.graphics.Typeface.BOLD)
                tv.setPadding(0, 0, 0, 10)
                container.addView(tv)
                
                val options = comp.getJSONArray("options")
                val radioGroup = RadioGroup(context)
                for (j in 0 until options.length()) {
                    val rb = RadioButton(context)
                    rb.text = options.getString(j)
                    rb.setTextColor(Color.parseColor("#EBFFFFFF"))
                    rb.setPadding(16, 10, 16, 10)
                    radioGroup.addView(rb)
                }
                container.addView(radioGroup)
            }
        }
    }
}
