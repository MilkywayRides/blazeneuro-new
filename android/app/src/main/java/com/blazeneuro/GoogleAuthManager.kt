package com.blazeneuro

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

class GoogleAuthManager(private val activity: Activity) {

    private val WEB_CLIENT_ID = "841705301007-bk1edu98tumanf3q6op8n3lrs6gbpaoq.apps.googleusercontent.com"
    private val credentialManager = CredentialManager.create(activity)

    suspend fun getIdToken(): Result<String> {
        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(WEB_CLIENT_ID)
            .setAutoSelectEnabled(false)
            .setNonce(generateNonce())
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        return try {
            val result = credentialManager.getCredential(
                context = activity,
                request = request
            )
            val credential = result.credential

            if (credential is CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val tokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                Result.success(tokenCredential.idToken)
            } else {
                Result.failure(Exception("Unexpected credential type"))
            }
        } catch (e: NoCredentialException) {
            Result.failure(Exception("No Google account found. Please add a Google account to your device."))
        } catch (e: GetCredentialException) {
            Result.failure(Exception("Sign-in cancelled or failed: ${e.message}"))
        } catch (e: Exception) {
            Result.failure(Exception("Sign-in error: ${e.message}"))
        }
    }
    
    private fun generateNonce(): String {
        return java.util.UUID.randomUUID().toString()
    }
}
