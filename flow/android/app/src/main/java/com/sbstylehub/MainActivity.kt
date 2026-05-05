package com.sbstylehub

import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp
import androidx.browser.customtabs.CustomTabsIntent
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MainActivity : ComponentActivity() {
    private val api = Retrofit.Builder()
        .baseUrl("http://10.55.14.40:3000/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
    
    private val prefs by lazy { getSharedPreferences("auth", MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val isAuthCallback = intent?.data?.scheme == "sbstylehub"
        if (isAuthCallback) {
            prefs.edit().putBoolean("authenticated", true).apply()
            // In production, extract user info from callback and save it
            prefs.edit().putString("userName", "User").apply()
        }
        
        setContent {
            MaterialTheme {
                AppScreen(
                    api, 
                    ::openBrowser, 
                    prefs.getBoolean("authenticated", false),
                    prefs.getString("userName", "User") ?: "User",
                    ::logout
                )
            }
        }
    }

    private fun openBrowser(url: String) {
        CustomTabsIntent.Builder().build().launchUrl(this, Uri.parse(url))
    }
    
    private fun logout() {
        prefs.edit().clear().apply()
        recreate()
    }
}

@Composable
fun AppScreen(api: ApiService, openBrowser: (String) -> Unit, isAuthenticated: Boolean, userName: String, onLogout: () -> Unit) {
    var prompt by remember { mutableStateOf("Trendy streetwear fashion design with bold colors and modern aesthetic") }
    var images by remember { mutableStateOf<List<String>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    if (!isAuthenticated) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (error != null) {
                Text(error!!, color = MaterialTheme.colorScheme.error)
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            Text("SB Style Hub", style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(onClick = {
                scope.launch {
                    try {
                        error = null
                        val response = api.getAuthUrl("sbstylehub://callback")
                        openBrowser(response.authUrl)
                    } catch (e: Exception) {
                        error = "Connection failed: ${e.message}"
                    }
                }
            }) {
                Text("Sign in with BlazeNeuro")
            }
        }
    } else {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("SB Style Hub", style = MaterialTheme.typography.headlineMedium)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(userName, style = MaterialTheme.typography.bodyMedium)
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(onClick = onLogout) {
                        AsyncImage(
                            model = "https://ui-avatars.com/api/?name=$userName&background=random",
                            contentDescription = "Logout",
                            modifier = Modifier.size(40.dp).clip(CircleShape)
                        )
                    }
                }
            }
            
            Column(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
        
        TextField(
            value = prompt,
            onValueChange = { prompt = it },
            label = { Text("Design prompt") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
                onClick = {
                    scope.launch {
                        try {
                            loading = true
                            error = null
                            val response = api.generateImages(ImageRequest(prompt))
                            images = response.images
                            error = "Got ${images.size} images"
                        } catch (e: Exception) {
                            error = "Failed: ${e.message}"
                        } finally {
                            loading = false
                        }
                    }
                },
                enabled = !loading && prompt.isNotEmpty()
            ) {
                Text(if (loading) "Generating..." else "Generate Images")
        }
        
        if (error != null) {
            Text(error!!, color = if (error!!.startsWith("Got")) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
        }
        
        if (images.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            
            LazyVerticalGrid(columns = GridCells.Fixed(2), modifier = Modifier.weight(1f)) {
                items(images) { base64Image ->
                    val imageData = if (base64Image.contains("base64,")) {
                        base64Image.substringAfter("base64,")
                    } else {
                        base64Image
                    }
                    val bitmap = remember(imageData) {
                        try {
                            val decodedBytes = Base64.decode(imageData, Base64.DEFAULT)
                            BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                        } catch (e: Exception) {
                            null
                        }
                    }
                    
                    if (bitmap != null) {
                        Image(
                            bitmap = bitmap.asImageBitmap(),
                            contentDescription = null,
                            modifier = Modifier.padding(4.dp).aspectRatio(1f)
                        )
                    } else {
                        Box(
                            modifier = Modifier.padding(4.dp).aspectRatio(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Failed")
                        }
                    }
                }
            }
            
            Button(
                    onClick = {
                        scope.launch {
                            try {
                                loading = true
                                error = null
                                api.generate3D(ModelRequest(images))
                            } catch (e: Exception) {
                                error = "3D failed: ${e.message}"
                            } finally {
                                loading = false
                            }
                        }
                    },
                    enabled = !loading
                ) {
                        Text("Convert to 3D")
                }
            }
            }
        }
    }
}
