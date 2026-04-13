package com.blazeneuro

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

data class GoogleIdTokenRequest(val idToken: String)
data class GitHubCodeRequest(val code: String, val state: String)
data class GoogleAuthResponse(val token: String, val user: UserData)
data class UserData(val id: String, val email: String, val name: String?, val role: String)

interface AuthApiService {
    @POST("api/auth/google/android")
    suspend fun verifyGoogleToken(@Body body: GoogleIdTokenRequest): GoogleAuthResponse
    
    @POST("api/auth/github/android/token")
    suspend fun verifyGitHubCode(@Body body: GitHubCodeRequest): GoogleAuthResponse
}

object RetrofitClient {
    private const val BASE_URL = "https://auth.blazeneuro.com/"

    val authService: AuthApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApiService::class.java)
    }
}
