package com.blazeneuro

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class BlogDetailActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_blog_detail)

        val slug = intent.getStringExtra("slug") ?: return finish()
        
        findViewById<TextView>(R.id.tvTitle).text = "Loading..."
        
        lifecycleScope.launch {
            loadBlog(slug)
        }
    }

    private suspend fun loadBlog(slug: String) {
        // For now just show the title from intent
        val title = intent.getStringExtra("title") ?: "Blog Post"
        val description = intent.getStringExtra("description") ?: ""
        
        findViewById<TextView>(R.id.tvTitle).text = title
        findViewById<TextView>(R.id.tvContent).text = description
    }
}
