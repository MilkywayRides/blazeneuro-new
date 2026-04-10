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
        findViewById<TextView>(R.id.tvContent).text = "Loading..."
        
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
            findViewById<TextView>(R.id.tvLikeCount).text = "${blog.likeCount}"
            findViewById<TextView>(R.id.tvDislikeCount).text = "${blog.dislikeCount}"
            
            markwon.setMarkdown(findViewById(R.id.tvContent), blog.content)
        } else {
            findViewById<TextView>(R.id.tvContent).text = "Failed to load blog content"
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
        
        // Update counts immediately for better UX
        val currentLikes = findViewById<TextView>(R.id.tvLikeCount).text.toString().toIntOrNull() ?: 0
        val currentDislikes = findViewById<TextView>(R.id.tvDislikeCount).text.toString().toIntOrNull() ?: 0
        if (liked) {
            findViewById<TextView>(R.id.tvLikeCount).text = "${currentLikes + 1}"
        } else {
            findViewById<TextView>(R.id.tvDislikeCount).text = "${currentDislikes + 1}"
        }
        Toast.makeText(this, if (liked) "Thanks for your feedback! 👍" else "Thanks for your feedback! 👎", Toast.LENGTH_SHORT).show()
        
        // Try to submit to backend (will fail until endpoint is created)
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
