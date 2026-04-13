package com.blazeneuro

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.bumptech.glide.Glide
import org.json.JSONArray
import org.json.JSONObject

class PopupDialog(private val context: Context, private val popupData: JSONObject) {
    
    fun show() {
        val dialog = Dialog(context)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        
        val view = LayoutInflater.from(context).inflate(R.layout.dialog_popup, null)
        val container = view.findViewById<LinearLayout>(R.id.popupContainer)
        val btnClose = view.findViewById<ImageButton>(R.id.btnClose)
        
        btnClose.setOnClickListener { dialog.dismiss() }
        
        val components = popupData.getJSONArray("components")
        for (i in 0 until components.length()) {
            val comp = components.getJSONObject(i)
            addComponent(container, comp)
        }
        
        dialog.setContentView(view)
        dialog.show()
    }
    
    private fun addComponent(container: LinearLayout, comp: JSONObject) {
        when (comp.getString("type")) {
            "title" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 20f
                tv.setTypeface(null, android.graphics.Typeface.BOLD)
                container.addView(tv)
            }
            "text" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 14f
                container.addView(tv)
            }
            "image" -> {
                val iv = ImageView(context)
                iv.layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                Glide.with(context).load(comp.getString("content")).into(iv)
                container.addView(iv)
            }
            "video" -> {
                val playerView = PlayerView(context)
                playerView.layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    600
                )
                val player = ExoPlayer.Builder(context).build()
                playerView.player = player
                val mediaItem = MediaItem.fromUri(Uri.parse(comp.getString("content")))
                player.setMediaItem(mediaItem)
                player.prepare()
                player.play()
                container.addView(playerView)
            }
            "poll" -> {
                val tv = TextView(context)
                tv.text = comp.getString("content")
                tv.textSize = 16f
                tv.setTypeface(null, android.graphics.Typeface.BOLD)
                container.addView(tv)
                
                val options = comp.getJSONArray("options")
                val radioGroup = RadioGroup(context)
                for (j in 0 until options.length()) {
                    val rb = RadioButton(context)
                    rb.text = options.getString(j)
                    radioGroup.addView(rb)
                }
                container.addView(radioGroup)
            }
        }
    }
}
