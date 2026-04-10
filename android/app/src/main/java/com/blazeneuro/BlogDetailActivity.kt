package com.blazeneuro

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import io.noties.markwon.Markwon
import io.noties.markwon.html.HtmlPlugin
import io.noties.markwon.image.glide.GlideImagesPlugin
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class BlogDetailActivity : AppCompatActivity() {
    private lateinit var markwon: Markwon
    private var blogId: String? = null
    private var currentBlog: AuthApi.BlogDetail? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_blog_detail)
        AuthApi.init(this)
        
        // Set status bar appearance based on theme
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            val nightMode = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
            if (nightMode == android.content.res.Configuration.UI_MODE_NIGHT_NO) {
                // Light mode - dark status bar icons
                window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            }
        }
        
        // Show loading spinner
        findViewById<android.view.View>(R.id.loadingSpinner).visibility = android.view.View.VISIBLE
        findViewById<android.widget.ScrollView>(R.id.scrollView).visibility = android.view.View.GONE
        findViewById<androidx.cardview.widget.CardView>(R.id.feedbackCard).visibility = android.view.View.GONE
        
        // Apply blur effect to header
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            findViewById<android.view.View>(R.id.headerBlur)?.setRenderEffect(
                android.graphics.RenderEffect.createBlurEffect(
                    15f, 15f, android.graphics.Shader.TileMode.CLAMP
                )
            )
        }

        markwon = Markwon.builder(this)
            .usePlugin(HtmlPlugin.create())
            .usePlugin(GlideImagesPlugin.create(this))
            .build()

        // Handle deep link
        val slug = intent.data?.lastPathSegment ?: intent.getStringExtra("slug") ?: return finish()
        
        val title = intent.getStringExtra("title") ?: "Blog Post"
        
        findViewById<TextView>(R.id.tvTitle).text = title
        
        findViewById<ImageView>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        findViewById<ImageView>(R.id.btnDownload).setOnClickListener {
            downloadBlog()
        }
        
        findViewById<android.view.View>(R.id.btnLike).setOnClickListener {
            android.util.Log.d("BlogDetail", "Like button clicked")
            submitFeedback(true)
        }
        
        findViewById<android.view.View>(R.id.btnDislike).setOnClickListener {
            android.util.Log.d("BlogDetail", "Dislike button clicked")
            submitFeedback(false)
        }
        
        lifecycleScope.launch {
            loadBlog(slug)
        }
    }

    private suspend fun loadBlog(slug: String) {
        val blog = AuthApi.getBlogDetail(slug)
        if (blog != null) {
            currentBlog = blog
            blogId = blog.id
            
            // Hide loading, show content
            findViewById<android.view.View>(R.id.loadingSpinner).visibility = android.view.View.GONE
            findViewById<android.widget.ScrollView>(R.id.scrollView).visibility = android.view.View.VISIBLE
            findViewById<androidx.cardview.widget.CardView>(R.id.feedbackCard).visibility = android.view.View.VISIBLE
            
            findViewById<TextView>(R.id.tvTitle).text = blog.title
            findViewById<TextView>(R.id.tvAuthor).text = blog.authorName ?: "Anonymous"
            
            // Load author avatar
            val ivAuthor = findViewById<ImageView>(R.id.ivAuthor)
            if (!blog.authorImage.isNullOrEmpty()) {
                com.bumptech.glide.Glide.with(this)
                    .load(blog.authorImage)
                    .circleCrop()
                    .placeholder(R.drawable.ic_profile)
                    .into(ivAuthor)
            }
            
            val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            val created = try { dateFormat.format(Date(blog.createdAt)) } catch (e: Exception) { "Recently" }
            val updated = try { dateFormat.format(Date(blog.updatedAt)) } catch (e: Exception) { "Recently" }
            
            findViewById<TextView>(R.id.tvMeta).text = "Published $created • Updated $updated"
            findViewById<TextView>(R.id.tvLikeCount).text = formatCount(blog.likeCount)
            findViewById<TextView>(R.id.tvDislikeCount).text = formatCount(blog.dislikeCount)
            
            markwon.setMarkdown(findViewById(R.id.tvContent), blog.content)
        } else {
            findViewById<TextView>(R.id.tvContent).text = "Failed to load blog content"
        }
    }
    
    private fun formatCount(count: Int): String {
        return when {
            count >= 1000000 -> String.format("%.1fM", count / 1000000.0)
            count >= 1000 -> String.format("%.1fK", count / 1000.0)
            else -> count.toString()
        }
    }

    private fun downloadBlog() {
        currentBlog?.let { blog ->
            try {
                val file = File(filesDir, "blog_${blog.id}.txt")
                file.writeText("${blog.title}\n\nBy ${blog.authorName}\n\n${blog.content}")
                Toast.makeText(this, "Blog saved to app storage", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this, "Failed to save blog", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun submitFeedback(liked: Boolean) {
        android.util.Log.d("BlogDetail", "submitFeedback called: liked=$liked, blogId=$blogId")
        val id = blogId
        if (id == null) {
            android.util.Log.e("BlogDetail", "blogId is null, cannot submit feedback")
            Toast.makeText(this, "Blog not loaded yet", Toast.LENGTH_SHORT).show()
            return
        }
        
        // Update counts immediately
        val currentLikes = findViewById<TextView>(R.id.tvLikeCount).text.toString().replace("K", "000").replace("M", "000000").toIntOrNull() ?: 0
        val currentDislikes = findViewById<TextView>(R.id.tvDislikeCount).text.toString().replace("K", "000").replace("M", "000000").toIntOrNull() ?: 0
        if (liked) {
            findViewById<TextView>(R.id.tvLikeCount).text = formatCount(currentLikes + 1)
        } else {
            findViewById<TextView>(R.id.tvDislikeCount).text = formatCount(currentDislikes + 1)
        }
        Toast.makeText(this, if (liked) "Thanks for your feedback! 👍" else "Thanks for your feedback! 👎", Toast.LENGTH_SHORT).show()
        
        // Animate card slide down and remove
        val feedbackCard = findViewById<androidx.cardview.widget.CardView>(R.id.feedbackCard)
        feedbackCard.animate()
            .translationY(feedbackCard.height.toFloat() + 100f)
            .alpha(0f)
            .setDuration(300)
            .withEndAction {
                feedbackCard.visibility = android.view.View.GONE
            }
            .start()
        
        // Try to submit to backend
        lifecycleScope.launch {
            try {
                android.util.Log.d("BlogDetail", "Submitting feedback: liked=$liked, blogId=$id")
                AuthApi.submitBlogFeedback(id, liked)
            } catch (e: Exception) {
                android.util.Log.e("BlogDetail", "Feedback submission failed (endpoint may not exist yet)", e)
            }
        }
    }
}
