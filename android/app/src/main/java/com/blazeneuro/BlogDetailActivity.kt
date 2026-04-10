package com.blazeneuro

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import io.noties.markwon.Markwon
import io.noties.markwon.html.HtmlPlugin
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

        markwon = Markwon.builder(this)
            .usePlugin(HtmlPlugin.create())
            .build()

        val slug = intent.getStringExtra("slug") ?: return finish()
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
            submitFeedback(true)
        }
        
        findViewById<android.view.View>(R.id.btnDislike).setOnClickListener {
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
        Toast.makeText(this, if (liked) "Thanks for your feedback! 👍" else "Thanks for your feedback! 👎", Toast.LENGTH_SHORT).show()
    }
}
