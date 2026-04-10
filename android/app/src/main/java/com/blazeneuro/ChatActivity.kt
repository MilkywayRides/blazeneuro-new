package com.blazeneuro

import android.os.Bundle
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class ChatActivity : AppCompatActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ChatAdapter
    private val messages = mutableListOf<ChatMessage>()
    private var isLoading = false
    private var replyToMessage: ChatMessage? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
        AuthApi.init(this)

        recyclerView = findViewById(R.id.rvMessages)
        recyclerView.layoutManager = LinearLayoutManager(this).apply {
            reverseLayout = true
            stackFromEnd = true
        }
        
        adapter = ChatAdapter(
            messages = messages,
            onReply = { message -> setReplyTo(message) },
            onDelete = { message -> deleteMessage(message) },
            onMention = { user -> mentionUser(user) }
        )
        recyclerView.adapter = adapter

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }
        findViewById<ImageView>(R.id.btnSend).setOnClickListener { sendMessage() }

        loadMessages()
        startPolling()
    }

    private fun loadMessages() {
        if (isLoading) return
        isLoading = true
        
        lifecycleScope.launch {
            try {
                val newMessages = AuthApi.getChatMessages()
                messages.clear()
                messages.addAll(newMessages)
                adapter.notifyDataSetChanged()
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Failed to load messages", Toast.LENGTH_SHORT).show()
            } finally {
                isLoading = false
            }
        }
    }

    private fun startPolling() {
        lifecycleScope.launch {
            while (true) {
                delay(3000)
                loadMessages()
            }
        }
    }

    private fun sendMessage() {
        val input = findViewById<EditText>(R.id.etMessage)
        val content = input.text.toString().trim()
        
        if (content.isEmpty()) return
        
        lifecycleScope.launch {
            try {
                val mentions = extractMentions(content)
                AuthApi.sendChatMessage(content, null, replyToMessage?.id, mentions)
                input.text.clear()
                replyToMessage = null
                findViewById<android.view.View>(R.id.replyPreview)?.visibility = android.view.View.GONE
                loadMessages()
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Failed to send message", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setReplyTo(message: ChatMessage) {
        replyToMessage = message
        findViewById<android.widget.TextView>(R.id.tvReplyPreview)?.text = "Replying to ${message.userName}"
        findViewById<android.view.View>(R.id.replyPreview)?.visibility = android.view.View.VISIBLE
    }

    private fun deleteMessage(message: ChatMessage) {
        lifecycleScope.launch {
            try {
                AuthApi.deleteChatMessage(message.id)
                loadMessages()
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Failed to delete message", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun mentionUser(user: String) {
        val input = findViewById<EditText>(R.id.etMessage)
        input.append("@$user ")
    }

    private fun extractMentions(content: String): List<String> {
        val regex = "@(\\w+)".toRegex()
        return regex.findAll(content).map { it.groupValues[1] }.toList()
    }
}

data class ChatMessage(
    val id: String,
    val userId: String,
    val userName: String,
    val userImage: String?,
    val content: String,
    val imageUrl: String?,
    val replyToId: String?,
    val createdAt: String
)
