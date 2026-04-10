package com.blazeneuro

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

class ChatAdapter(
    private val messages: List<ChatMessage>,
    private val onReply: (ChatMessage) -> Unit,
    private val onDelete: (ChatMessage) -> Unit,
    private val onMention: (String) -> Unit
) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivAvatar: ImageView = view.findViewById(R.id.ivAvatar)
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvContent: TextView = view.findViewById(R.id.tvContent)
        val tvTime: TextView = view.findViewById(R.id.tvTime)
        val ivImage: ImageView = view.findViewById(R.id.ivImage)
        val btnReply: View = view.findViewById(R.id.btnReply)
        val btnDelete: View = view.findViewById(R.id.btnDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_chat_message, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val message = messages[position]
        
        holder.tvName.text = message.userName
        holder.tvContent.text = message.content
        holder.tvTime.text = formatTime(message.createdAt)
        
        if (message.userImage != null) {
            Glide.with(holder.ivAvatar)
                .load(message.userImage)
                .circleCrop()
                .into(holder.ivAvatar)
        }
        
        if (message.imageUrl != null) {
            holder.ivImage.visibility = View.VISIBLE
            Glide.with(holder.ivImage)
                .load(message.imageUrl)
                .into(holder.ivImage)
        } else {
            holder.ivImage.visibility = View.GONE
        }
        
        holder.btnReply.setOnClickListener { onReply(message) }
        holder.btnDelete.setOnClickListener { onDelete(message) }
        holder.tvName.setOnClickListener { onMention(message.userName) }
    }

    override fun getItemCount() = messages.size

    private fun formatTime(timestamp: String): String {
        return try {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
            val date = sdf.parse(timestamp)
            val now = java.util.Date()
            val diff = now.time - (date?.time ?: 0)
            
            when {
                diff < 60000 -> "Just now"
                diff < 3600000 -> "${diff / 60000}m ago"
                diff < 86400000 -> "${diff / 3600000}h ago"
                else -> "${diff / 86400000}d ago"
            }
        } catch (e: Exception) {
            "Recently"
        }
    }
}
