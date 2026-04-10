package com.blazeneuro

import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class ChatFragment : Fragment(R.layout.fragment_chat) {
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ChatAdapter
    private val messages = mutableListOf<ChatMessage>()
    private var isLoading = false
    private var replyToMessage: ChatMessage? = null

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        recyclerView = view.findViewById(R.id.rvMessages)
        recyclerView.layoutManager = LinearLayoutManager(context).apply {
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

        view.findViewById<ImageView>(R.id.btnSend).setOnClickListener { sendMessage() }

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
                Toast.makeText(context, "Failed to load messages", Toast.LENGTH_SHORT).show()
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
        val input = view?.findViewById<EditText>(R.id.etMessage) ?: return
        val content = input.text.toString().trim()
        
        if (content.isEmpty()) return
        
        lifecycleScope.launch {
            try {
                val mentions = extractMentions(content)
                AuthApi.sendChatMessage(content, null, replyToMessage?.id, mentions)
                input.text.clear()
                replyToMessage = null
                view?.findViewById<View>(R.id.replyPreview)?.visibility = View.GONE
                loadMessages()
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to send message", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setReplyTo(message: ChatMessage) {
        replyToMessage = message
        view?.findViewById<android.widget.TextView>(R.id.tvReplyPreview)?.text = "Replying to ${message.userName}"
        view?.findViewById<View>(R.id.replyPreview)?.visibility = View.VISIBLE
    }

    private fun deleteMessage(message: ChatMessage) {
        lifecycleScope.launch {
            try {
                AuthApi.deleteChatMessage(message.id)
                loadMessages()
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to delete message", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun mentionUser(user: String) {
        val input = view?.findViewById<EditText>(R.id.etMessage) ?: return
        input.append("@$user ")
    }

    private fun extractMentions(content: String): List<String> {
        val regex = "@(\\w+)".toRegex()
        return regex.findAll(content).map { it.groupValues[1] }.toList()
    }
}
