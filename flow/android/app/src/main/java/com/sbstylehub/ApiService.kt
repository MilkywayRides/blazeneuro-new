package com.sbstylehub

import retrofit2.http.*

data class AuthResponse(val authUrl: String)
data class ImageRequest(val prompt: String)
data class ImageResponse(val images: List<String>)
data class ModelRequest(val imageUrls: List<String>)
data class ModelResponse(val modelUrl: String)

interface ApiService {
    @GET("api/auth/mobile")
    suspend fun getAuthUrl(@Query("callbackUrl") callbackUrl: String): AuthResponse
    
    @POST("api/generate-images")
    suspend fun generateImages(@Body request: ImageRequest): ImageResponse
    
    @POST("api/generate-3d")
    suspend fun generate3D(@Body request: ModelRequest): ModelResponse
}
