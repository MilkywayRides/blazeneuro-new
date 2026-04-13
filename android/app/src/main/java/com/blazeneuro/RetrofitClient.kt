package com.blazeneuro

import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
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

    private val cookieJar = object : CookieJar {
        private val cookieStore = mutableMapOf<String, List<Cookie>>()

        override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
            cookieStore[url.host] = cookies
        }

        override fun loadForRequest(url: HttpUrl): List<Cookie> {
            return cookieStore[url.host] ?: emptyList()
        }
    }

    private val okHttpClient = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .build()

    val authService: AuthApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApiService::class.java)
    }
}
