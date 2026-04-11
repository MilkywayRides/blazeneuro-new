package com.blazeneuro

import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import org.json.JSONObject
import java.net.URISyntaxException

object CommunitySocket {
    private var socket: Socket? = null
    private val listeners = mutableMapOf<String, MutableList<(Any) -> Unit>>()

    fun connect() {
        if (socket?.connected() == true) return
        
        try {
            val opts = IO.Options().apply {
                path = "/api/community/socket"
                reconnection = true
                reconnectionDelay = 1000
                reconnectionAttempts = 5
            }
            
            socket = IO.socket("https://blazeneuro.com", opts)
            
            socket?.on(Socket.EVENT_CONNECT) {
                android.util.Log.d("CommunitySocket", "Connected")
                socket?.emit("community:join")
            }
            
            socket?.on(Socket.EVENT_DISCONNECT) {
                android.util.Log.d("CommunitySocket", "Disconnected")
            }
            
            socket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
                android.util.Log.e("CommunitySocket", "Connection error: ${args.firstOrNull()}")
            }
            
            socket?.connect()
        } catch (e: URISyntaxException) {
            android.util.Log.e("CommunitySocket", "Socket connection error", e)
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket = null
    }

    fun on(event: String, callback: (Any) -> Unit) {
        if (!listeners.containsKey(event)) {
            listeners[event] = mutableListOf()
            socket?.on(event, Emitter.Listener { args ->
                listeners[event]?.forEach { it(args.firstOrNull() ?: Unit) }
            })
        }
        listeners[event]?.add(callback)
    }

    fun off(event: String, callback: (Any) -> Unit) {
        listeners[event]?.remove(callback)
    }

    fun emit(event: String, data: JSONObject) {
        socket?.emit(event, data)
    }

    fun isConnected() = socket?.connected() == true
}
