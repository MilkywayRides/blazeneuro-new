package com.blazeneuro

import android.os.Bundle
import android.view.View
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.drawerlayout.widget.DrawerLayout
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch

class CourseDetailActivity : AppCompatActivity() {
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var pageList: RecyclerView
    private lateinit var contentContainer: FrameLayout
    private lateinit var swipeRefresh: androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var progressText: TextView
    private lateinit var btnPrevious: ImageView
    private lateinit var btnNext: ImageView
    private lateinit var tvCourseTitle: TextView
    
    private var course: AuthApi.CourseDetail? = null
    private var currentPageIndex = 0
    private val adapter = PageAdapter()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_course_detail)

        val courseId = intent.getStringExtra("courseId") ?: run {
            finish()
            return
        }

        drawerLayout = findViewById(R.id.drawerLayout)
        pageList = findViewById(R.id.pageList)
        contentContainer = findViewById(R.id.contentContainer)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)
        progressText = findViewById(R.id.progressText)
        btnPrevious = findViewById(R.id.btnPrevious)
        btnNext = findViewById(R.id.btnNext)
        tvCourseTitle = findViewById(R.id.tvCourseTitle)

        swipeRefresh.setOnRefreshListener {
            loadPage(currentPageIndex)
            swipeRefresh.isRefreshing = false
        }

        findViewById<ImageView>(R.id.btnMenu).setOnClickListener {
            drawerLayout.openDrawer(android.view.Gravity.START)
        }

        pageList.layoutManager = LinearLayoutManager(this)
        pageList.adapter = adapter

        btnPrevious.setOnClickListener { navigatePrevious() }
        btnNext.setOnClickListener { navigateNext() }

        // Setup BlurView
        val progressCard = findViewById<eightbitlab.com.blurview.BlurView>(R.id.progressCard)
        val decorView = window.decorView
        val rootView = decorView.findViewById<android.view.ViewGroup>(android.R.id.content)
        progressCard.setupWith(rootView, eightbitlab.com.blurview.RenderScriptBlur(this))
            .setBlurRadius(20f)
            .setBlurAutoUpdate(true)
        
        progressCard.outlineProvider = object : android.view.ViewOutlineProvider() {
            override fun getOutline(view: android.view.View, outline: android.graphics.Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, 20f * resources.displayMetrics.density)
            }
        }
        progressCard.clipToOutline = true

        loadCourse(courseId)
    }

    private fun initializeViews() {
        drawerLayout = findViewById(R.id.drawerLayout)
        pageList = findViewById(R.id.pageList)
        contentContainer = findViewById(R.id.contentContainer)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)
        progressText = findViewById(R.id.progressText)
        btnPrevious = findViewById(R.id.btnPrevious)
        btnNext = findViewById(R.id.btnNext)
        tvCourseTitle = findViewById(R.id.tvCourseTitle)

        swipeRefresh.setOnRefreshListener {
            loadPage(currentPageIndex)
            swipeRefresh.isRefreshing = false
        }

        findViewById<ImageView>(R.id.btnMenu).setOnClickListener {
            drawerLayout.openDrawer(android.view.Gravity.START)
        }

        pageList.layoutManager = LinearLayoutManager(this)
        pageList.adapter = adapter

        btnPrevious.setOnClickListener { navigatePrevious() }
        btnNext.setOnClickListener { navigateNext() }

        // Setup BlurView
        val progressCard = findViewById<eightbitlab.com.blurview.BlurView>(R.id.progressCard)
        val decorView = window.decorView
        val rootView = decorView.findViewById<android.view.ViewGroup>(android.R.id.content)
        progressCard.setupWith(rootView, eightbitlab.com.blurview.RenderScriptBlur(this))
            .setBlurRadius(20f)
            .setBlurAutoUpdate(true)
        
        progressCard.outlineProvider = object : android.view.ViewOutlineProvider() {
            override fun getOutline(view: android.view.View, outline: android.graphics.Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, 20f * resources.displayMetrics.density)
            }
        }
        progressCard.clipToOutline = true
    }

    private fun loadCourse(courseId: String) {
        lifecycleScope.launch {
            val result = AuthApi.getCourseDetail(courseId)
            if (result != null) {
                course = result
                tvCourseTitle.text = result.title
                adapter.setPages(result.pages)
                if (result.pages.isNotEmpty()) {
                    loadPage(0)
                }
                updateProgress()
            } else {
                Toast.makeText(this@CourseDetailActivity, "Failed to load course", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }

    private fun loadPage(index: Int) {
        val pages = course?.pages ?: return
        if (index < 0 || index >= pages.size) return

        currentPageIndex = index
        val page = pages[index]
        adapter.setSelectedIndex(index)
        drawerLayout.closeDrawer(android.view.Gravity.START)

        contentContainer.removeAllViews()
        val webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            webChromeClient = object : android.webkit.WebChromeClient() {
                private var customView: View? = null
                
                override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                    if (customView != null) {
                        callback?.onCustomViewHidden()
                        return
                    }
                    
                    customView = view
                    window.decorView.systemUiVisibility = (
                        View.SYSTEM_UI_FLAG_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    )
                    requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                    
                    val decorView = window.decorView as android.view.ViewGroup
                    decorView.addView(view, android.view.ViewGroup.LayoutParams(
                        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                        android.view.ViewGroup.LayoutParams.MATCH_PARENT
                    ))
                }
                
                override fun onHideCustomView() {
                    if (customView == null) return
                    
                    window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
                    requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                    
                    val decorView = window.decorView as android.view.ViewGroup
                    decorView.removeView(customView)
                    customView = null
                }
            }
        }
        contentContainer.addView(webView)

        when (page.contentType) {
            "ARTICLE" -> {
                val content = page.body ?: ""
                val htmlContent = content
                    .replace(Regex("### (.+)"), "<h3>$1</h3>")
                    .replace(Regex("## (.+)"), "<h2>$1</h2>")
                    .replace(Regex("# (.+)"), "<h1>$1</h1>")
                    .replace(Regex("\\*\\*(.+?)\\*\\*"), "<strong>$1</strong>")
                    .replace(Regex("\\*(.+?)\\*"), "<em>$1</em>")
                    .replace(Regex("`(.+?)`"), "<code>$1</code>")
                    .replace(Regex("\\[(.+?)\\]\\((.+?)\\)"), "<a href=\"$2\">$1</a>")
                    .replace("\n\n", "</p><p>")
                    .replace("\n", "<br>")
                
                val html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            html { margin: 0; padding: 0; }
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                padding: 8px 16px 80px 16px;
                                line-height: 1.6;
                                color: #e5e5e5;
                                background: #0a0a0a;
                                margin: 0;
                            }
                            h1, h2, h3 { color: #ffffff; margin-top: 12px; margin-bottom: 8px; }
                            h1 { font-size: 24px; margin-top: 0; }
                            h2 { font-size: 20px; }
                            h3 { font-size: 18px; }
                            p { margin-bottom: 10px; margin-top: 0; }
                            a { color: #3b82f6; text-decoration: none; }
                            code { 
                                background: #1a1a1a; 
                                padding: 2px 6px; 
                                border-radius: 4px; 
                                font-family: monospace;
                                color: #f97316;
                            }
                            strong { color: #ffffff; }
                        </style>
                    </head>
                    <body>$htmlContent</body>
                    </html>
                """.trimIndent()
                webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
                
                // Add reactions below article
                val reactionsView = layoutInflater.inflate(R.layout.layout_page_reactions, contentContainer, false)
                contentContainer.addView(reactionsView)
                setupReactions(reactionsView, page)
            }
            "VIDEO" -> {
                val videoUrl = page.videoUrl ?: ""
                
                // Create a vertical container for video + reactions
                val container = android.widget.LinearLayout(this).apply {
                    orientation = android.widget.LinearLayout.VERTICAL
                    layoutParams = FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT
                    )
                }
                
                // Add video WebView
                val webView = WebView(this).apply {
                    layoutParams = android.widget.LinearLayout.LayoutParams(
                        android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                        android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                    )
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    webChromeClient = object : android.webkit.WebChromeClient() {
                        private var customView: View? = null
                        
                        override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                            if (customView != null) {
                                callback?.onCustomViewHidden()
                                return
                            }
                            
                            customView = view
                            window.decorView.systemUiVisibility = (
                                View.SYSTEM_UI_FLAG_FULLSCREEN
                                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            )
                            requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                            
                            val decorView = window.decorView as android.view.ViewGroup
                            decorView.addView(view, android.view.ViewGroup.LayoutParams(
                                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                                android.view.ViewGroup.LayoutParams.MATCH_PARENT
                            ))
                        }
                        
                        override fun onHideCustomView() {
                            if (customView == null) return
                            
                            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
                            requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                            
                            val decorView = window.decorView as android.view.ViewGroup
                            decorView.removeView(customView)
                            customView = null
                        }
                    }
                }
                
                val html = if (videoUrl.contains("youtube.com") || videoUrl.contains("youtu.be")) {
                    val videoId = videoUrl.substringAfter("watch?v=").substringAfter("youtu.be/").substringBefore("&")
                    """
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                * { margin: 0; padding: 0; }
                                body { background: #000; overflow: hidden; }
                                .video-wrapper { 
                                    position: relative; 
                                    width: 100%; 
                                    padding-bottom: 56.25%;
                                }
                                .video-wrapper iframe { 
                                    position: absolute; 
                                    top: 0; 
                                    left: 0; 
                                    width: 100%; 
                                    height: 100%;
                                    border: none;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="video-wrapper">
                                <iframe src="https://www.youtube.com/embed/$videoId?autoplay=1&playsinline=1&fs=1" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                                    allowfullscreen
                                    webkitallowfullscreen
                                    mozallowfullscreen></iframe>
                            </div>
                        </body>
                        </html>
                    """.trimIndent()
                } else {
                    """
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                * { margin: 0; padding: 0; }
                                body { background: #000; }
                                video { width: 100%; height: auto; display: block; }
                            </style>
                        </head>
                        <body>
                            <video width="100%" controls autoplay playsinline controlsList="nodownload">
                                <source src="$videoUrl" type="video/mp4">
                            </video>
                        </body>
                        </html>
                    """.trimIndent()
                }
                webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
                
                container.addView(webView)
                
                // Add reactions below video
                val reactionsView = layoutInflater.inflate(R.layout.layout_page_reactions, null, false)
                container.addView(reactionsView)
                setupReactions(reactionsView, page)
                
                contentContainer.addView(container)
            }
            else -> {
                webView.loadData("<html><body style='padding:20px;color:#fff;background:#0a0a0a;'><p>Quiz coming soon</p></body></html>", "text/html", "UTF-8")
            }
        }

        updateButtons()
    }

    private fun navigatePrevious() {
        if (currentPageIndex > 0) {
            markCurrentIncomplete()
            loadPage(currentPageIndex - 1)
        }
    }

    private fun navigateNext() {
        val pages = course?.pages ?: return
        if (currentPageIndex < pages.size - 1) {
            markCurrentComplete()
            loadPage(currentPageIndex + 1)
        } else {
            markCurrentComplete()
        }
    }

    private fun markCurrentComplete() {
        val courseId = course?.id ?: return
        val page = course?.pages?.getOrNull(currentPageIndex) ?: return
        
        lifecycleScope.launch {
            AuthApi.markPageComplete(courseId, page.id)
            course?.pages?.get(currentPageIndex)?.let {
                val updated = it.copy(completed = true)
                course = course?.copy(pages = course!!.pages.toMutableList().apply { set(currentPageIndex, updated) })
                adapter.setPages(course!!.pages)
                updateProgress()
            }
        }
    }

    private fun markCurrentIncomplete() {
        val page = course?.pages?.getOrNull(currentPageIndex) ?: return
        course?.pages?.get(currentPageIndex)?.let {
            val updated = it.copy(completed = false)
            course = course?.copy(pages = course!!.pages.toMutableList().apply { set(currentPageIndex, updated) })
            adapter.setPages(course!!.pages)
            updateProgress()
        }
    }

    private fun updateButtons() {
        val pages = course?.pages ?: return
        btnPrevious.alpha = if (currentPageIndex > 0) 1f else 0.3f
        btnPrevious.isEnabled = currentPageIndex > 0
    }

    private fun updateProgress() {
        val pages = course?.pages ?: return
        val completed = pages.count { it.completed }
        val total = pages.size
        val progress = if (total > 0) (completed * 100) / total else 0
        
        progressBar.progress = progress
    }

    private fun setupReactions(view: View, page: AuthApi.CoursePage) {
        val btnLike = view.findViewById<android.view.ViewGroup>(R.id.btnLike)
        val btnDislike = view.findViewById<android.view.ViewGroup>(R.id.btnDislike)
        val tvLikeCount = view.findViewById<TextView>(R.id.tvLikeCount)
        val tvDislikeCount = view.findViewById<TextView>(R.id.tvDislikeCount)
        val tvPageTitle = view.findViewById<TextView>(R.id.tvPageTitle)
        val publisherSection = view.findViewById<android.view.ViewGroup>(R.id.publisherSection)
        val tvPublisherAvatar = view.findViewById<TextView>(R.id.tvPublisherAvatar)
        val tvPublisherName = view.findViewById<TextView>(R.id.tvPublisherName)
        val btnFollow = view.findViewById<TextView>(R.id.btnFollow)
        
        tvPageTitle.text = page.title
        
        // Setup publisher info
        course?.publisher?.let { publisher ->
            publisherSection.visibility = View.VISIBLE
            tvPublisherAvatar.text = publisher.name.firstOrNull()?.uppercase() ?: "?"
            tvPublisherName.text = publisher.name
            
            btnFollow.text = if (course?.isFollowing == true) "Following" else "Follow"
            btnFollow.setBackgroundResource(
                if (course?.isFollowing == true) R.drawable.feedback_glass_btn 
                else R.drawable.button_primary
            )
            
            btnFollow.setOnClickListener {
                lifecycleScope.launch {
                    val newState = !(course?.isFollowing ?: false)
                    val res = if (newState) {
                        AuthApi.followPublisher(course?.id ?: return@launch)
                    } else {
                        AuthApi.unfollowPublisher(course?.id ?: return@launch)
                    }
                    
                    if (res) {
                        course = course?.copy(isFollowing = newState)
                        btnFollow.text = if (newState) "Following" else "Follow"
                        btnFollow.setBackgroundResource(
                            if (newState) R.drawable.feedback_glass_btn 
                            else R.drawable.button_primary
                        )
                    }
                }
            }
        } ?: run {
            publisherSection.visibility = View.GONE
        }
        
        var currentReaction = page.userReaction
        var likeCount = page.likeCount
        var dislikeCount = page.dislikeCount
        
        fun updateUI() {
            tvLikeCount.text = likeCount.toString()
            tvDislikeCount.text = dislikeCount.toString()
            
            btnLike.setBackgroundResource(
                if (currentReaction == true) R.drawable.feedback_glass_btn_active 
                else R.drawable.feedback_glass_btn
            )
            btnDislike.setBackgroundResource(
                if (currentReaction == false) R.drawable.feedback_glass_btn_active 
                else R.drawable.feedback_glass_btn
            )
        }
        
        updateUI()
        
        btnLike.setOnClickListener {
            lifecycleScope.launch {
                if (currentReaction == true) {
                    // Remove like
                    AuthApi.removeReaction(page.id)
                    likeCount--
                    currentReaction = null
                } else {
                    // Add/switch to like
                    AuthApi.reactToPage(page.id, true)
                    if (currentReaction == false) dislikeCount--
                    likeCount++
                    currentReaction = true
                }
                updateUI()
            }
        }
        
        btnDislike.setOnClickListener {
            lifecycleScope.launch {
                if (currentReaction == false) {
                    // Remove dislike
                    AuthApi.removeReaction(page.id)
                    dislikeCount--
                    currentReaction = null
                } else {
                    // Add/switch to dislike
                    AuthApi.reactToPage(page.id, false)
                    if (currentReaction == true) likeCount--
                    dislikeCount++
                    currentReaction = false
                }
                updateUI()
            }
        }
    }

    inner class PageAdapter : RecyclerView.Adapter<PageAdapter.ViewHolder>() {
        private var pages = listOf<AuthApi.CoursePage>()
        private var selectedIndex = 0

        fun setPages(newPages: List<AuthApi.CoursePage>) {
            pages = newPages
            notifyDataSetChanged()
        }

        fun setSelectedIndex(index: Int) {
            val oldIndex = selectedIndex
            selectedIndex = index
            notifyItemChanged(oldIndex)
            notifyItemChanged(selectedIndex)
        }

        override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
            val view = layoutInflater.inflate(R.layout.item_course_page, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val page = pages[position]
            holder.title.text = page.title
            
            val iconRes = when (page.contentType) {
                "VIDEO" -> R.drawable.ic_play_circle
                "ARTICLE" -> R.drawable.ic_blogs
                else -> R.drawable.ic_help
            }
            holder.icon.setImageResource(iconRes)
            
            holder.checkmark.visibility = if (page.completed) View.VISIBLE else View.GONE
            
            holder.itemView.alpha = if (position == selectedIndex) 1f else 0.6f
            holder.itemView.setOnClickListener { loadPage(position) }
        }

        override fun getItemCount() = pages.size

        inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val title: TextView = view.findViewById(R.id.tvPageTitle)
            val icon: ImageView = view.findViewById(R.id.ivPageIcon)
            val checkmark: ImageView = view.findViewById(R.id.ivCheckmark)
        }
    }
}
