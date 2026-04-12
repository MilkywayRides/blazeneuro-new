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
    private var lastMessageId: String? = null
    private var hasMore = true
    private lateinit var layoutManager: LinearLayoutManager
    private lateinit var swipeRefresh: androidx.swiperefreshlayout.widget.SwipeRefreshLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
        AuthApi.init(this)

        layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = false
        }
        recyclerView = findViewById(R.id.rvMessages)
        recyclerView.layoutManager = layoutManager
        
        swipeRefresh = findViewById(R.id.swipeRefresh)
        swipeRefresh.setOnRefreshListener {
            checkNewMessages()
        }
        
        adapter = ChatAdapter(
            messages = messages,
            onReply = { message -> setReplyTo(message) },
            onDelete = { message -> deleteMessage(message) },
            onMention = { user -> mentionUser(user) }
        )
        recyclerView.adapter = adapter
        
        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                if (!isLoading && hasMore && layoutManager.findFirstVisibleItemPosition() == 0) {
                    loadMoreMessages()
                }
            }
        })

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }
        findViewById<ImageView>(R.id.btnSend).setOnClickListener { sendMessage() }

        loadMessages()
    }

    private fun loadMessages() {
        if (isLoading) return
        isLoading = true
        
        lifecycleScope.launch {
            try {
                val newMessages = AuthApi.getChatMessages(limit = 20)
                messages.clear()
                messages.addAll(newMessages)
                lastMessageId = newMessages.firstOrNull()?.id
                adapter.notifyDataSetChanged()
                recyclerView.scrollToPosition(messages.size - 1)
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Failed to load messages", Toast.LENGTH_SHORT).show()
            } finally {
                isLoading = false
            }
        }
    }
    
    private fun loadMoreMessages() {
        if (isLoading || !hasMore) return
        isLoading = true
        
        lifecycleScope.launch {
            try {
                val oldMessages = AuthApi.getChatMessages(limit = 20, before = lastMessageId)
                if (oldMessages.isEmpty()) {
                    hasMore = false
                } else {
                    messages.addAll(0, oldMessages)
                    lastMessageId = oldMessages.firstOrNull()?.id
                    adapter.notifyItemRangeInserted(0, oldMessages.size)
                    layoutManager.scrollToPositionWithOffset(oldMessages.size, 0)
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Failed to load more", Toast.LENGTH_SHORT).show()
            } finally {
                isLoading = false
            }
        }
    }
    
    private fun checkNewMessages() {
        lifecycleScope.launch {
            try {
                val newMessages = AuthApi.getChatMessages(limit = 20)
                val latestId = newMessages.lastOrNull()?.id
                if (latestId != null && latestId != messages.lastOrNull()?.id) {
                    val fresh = newMessages.filter { msg ->
                        messages.none { it.id == msg.id }
                    }
                    messages.addAll(fresh)
                    adapter.notifyItemRangeInserted(messages.size - fresh.size, fresh.size)
                    recyclerView.scrollToPosition(messages.size - 1)
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Failed to refresh", Toast.LENGTH_SHORT).show()
            } finally {
                swipeRefresh.isRefreshing = false
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
                
                // Add new message to bottom
                val newMsg = AuthApi.getChatMessages(limit = 1)
                if (newMsg.isNotEmpty()) {
                    messages.add(newMsg[0])
                    adapter.notifyItemInserted(messages.size - 1)
                    recyclerView.scrollToPosition(messages.size - 1)
                }
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
