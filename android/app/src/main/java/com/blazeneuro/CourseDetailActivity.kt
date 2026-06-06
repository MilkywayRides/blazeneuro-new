package com.blazeneuro

import android.animation.Animator
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.transition.TransitionManager
import android.util.Log
import android.view.View
import android.view.ViewGroup
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
import com.airbnb.lottie.LottieAnimationView
import io.noties.markwon.Markwon
import io.noties.markwon.syntax.Prism4jSyntaxHighlight
import io.noties.markwon.syntax.SyntaxHighlightPlugin
import io.noties.prism4j.Prism4j
import io.noties.prism4j.GrammarLocator
import io.noties.markwon.syntax.Prism4jThemeDarkula
import io.noties.markwon.syntax.Prism4jThemeDefault
import io.noties.markwon.ext.tables.TablePlugin
import io.noties.markwon.html.HtmlPlugin
import io.noties.markwon.image.glide.GlideImagesPlugin
import io.noties.markwon.recycler.MarkwonAdapter
import io.noties.markwon.recycler.SimpleEntry
import org.commonmark.node.FencedCodeBlock
import org.commonmark.node.IndentedCodeBlock
import android.content.ClipData
import android.content.ClipboardManager
import kotlinx.coroutines.launch

class CourseDetailActivity : AppCompatActivity() {
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var pageList: RecyclerView
    private lateinit var contentContainer: FrameLayout
    private lateinit var stickyVideoContainer: FrameLayout
    private lateinit var swipeRefresh: androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var progressText: TextView
    private lateinit var btnPrevious: ImageView
    private lateinit var btnNext: ImageView
    private lateinit var tvCourseTitle: TextView
    private lateinit var markwon: Markwon
    private val prism4j = Prism4j(MyPrismGrammarLocator())
    
    private var course: AuthApi.CourseDetail? = null
    private var currentPageIndex = 0
    private var targetPageId: String? = null
    private val adapter = PageAdapter()
    private var isCardExpanded = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
        window.statusBarColor = Color.TRANSPARENT
        
        setContentView(R.layout.activity_course_detail)

        handleIntent(intent)
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: android.content.Intent) {
        val uri = intent.data
        var courseId = intent.getStringExtra("courseId")
        targetPageId = intent.getStringExtra("pageId")

        if (uri != null && uri.host == "blazeneuro.com") {
            courseId = uri.getQueryParameter("courseId")
            targetPageId = uri.getQueryParameter("pageId")
        }

        if (courseId == null) {
            finish()
            return
        }

        drawerLayout = findViewById<View>(R.id.sidebarMenu).parent as DrawerLayout
        pageList = findViewById(R.id.pageList)
        contentContainer = findViewById(R.id.contentContainer)
        stickyVideoContainer = findViewById(R.id.stickyVideoContainer)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)
        progressText = findViewById(R.id.progressText)
        btnPrevious = findViewById(R.id.btnPrevious)
        btnNext = findViewById(R.id.btnNext)
        tvCourseTitle = findViewById(R.id.tvCourseTitle)
        
        // Handle window insets for fixedHeader
        val fixedHeader = findViewById<View>(R.id.fixedHeader)
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(fixedHeader) { v, insets ->
            val statusInsets = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.statusBars())
            v.setPadding(v.paddingLeft, statusInsets.top + (16 * resources.displayMetrics.density).toInt(), v.paddingRight, v.paddingBottom)
            insets
        }

        val isDarkMode = (resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES
        val prismTheme = if (isDarkMode) Prism4jThemeDarkula.create() else Prism4jThemeDefault.create()

        markwon = Markwon.builder(this)
            .usePlugin(HtmlPlugin.create())
            .usePlugin(TablePlugin.create(this))
            .usePlugin(GlideImagesPlugin.create(this))
            .usePlugin(SyntaxHighlightPlugin.create(prism4j, prismTheme))
            .usePlugin(object : io.noties.markwon.AbstractMarkwonPlugin() {
                override fun configureTheme(builder: io.noties.markwon.core.MarkwonTheme.Builder) {
                    val codeBg = if (isDarkMode) Color.parseColor("#1e1e1e") else Color.parseColor("#f0f0f0")
                    builder
                        .codeBlockBackgroundColor(codeBg)
                        .codeBackgroundColor(codeBg)
                        .codeBlockTextColor(if (isDarkMode) Color.WHITE else Color.BLACK)
                }
            })
            .build()

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

        // Setup Expandable Progress Card
        val progressHeader = findViewById<View>(R.id.progressHeader)
        val rvExpandedPages = findViewById<RecyclerView>(R.id.rvExpandedPages)
        rvExpandedPages.layoutManager = LinearLayoutManager(this)
        rvExpandedPages.adapter = adapter

        progressHeader.setOnClickListener {
            toggleCardExpansion(progressCard, rvExpandedPages)
        }

        // Fold expanded card on tap outside
        findViewById<View>(android.R.id.content).setOnClickListener {
            if (isCardExpanded) {
                toggleCardExpansion(progressCard, rvExpandedPages)
            }
        }
        
        // Fix SwipeRefresh vs ScrollView conflict
        val nestedScrollView = findViewById<androidx.core.widget.NestedScrollView>(R.id.nestedScrollView)
        nestedScrollView.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            swipeRefresh.isEnabled = scrollY == 0
        }

        val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        if (!prefs.getBoolean("has_seen_course_guide", false)) {
            val guideOverlay = findViewById<View>(R.id.guideOverlay)
            guideOverlay.visibility = View.VISIBLE
            findViewById<View>(R.id.btnGotIt).setOnClickListener {
                guideOverlay.animate().alpha(0f).setDuration(300).withEndAction {
                    guideOverlay.visibility = View.GONE
                }.start()
                prefs.edit().putBoolean("has_seen_course_guide", true).apply()
            }
        }

        loadCourse(courseId)
    }

    private fun toggleCardExpansion(progressCard: ViewGroup, rvExpandedPages: RecyclerView) {
        isCardExpanded = !isCardExpanded

        // Vibrate slight
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(30, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            vibrator.vibrate(30)
        }

        // Animate the handle transparency/rotation if needed
        val expandHandle = findViewById<View>(R.id.expandHandle)
        expandHandle?.animate()?.alpha(if (isCardExpanded) 0.8f else 0.4f)?.setDuration(300)?.start()

        TransitionManager.beginDelayedTransition(progressCard)
        rvExpandedPages.visibility = if (isCardExpanded) View.VISIBLE else View.GONE

        if (isCardExpanded) {
            rvExpandedPages.scrollToPosition(currentPageIndex)
        }
    }
    private fun loadCourse(courseId: String) {
        lifecycleScope.launch {
            try {
                val result = AuthApi.getCourseDetail(courseId)
                if (result != null) {
                    course = result
                    tvCourseTitle.text = result.title
                    adapter.setPages(result.pages)
                    if (result.pages.isNotEmpty()) {
                        val startIndex = if (targetPageId != null) {
                            val foundIndex = result.pages.indexOfFirst { it.id == targetPageId }
                            if (foundIndex != -1) foundIndex else 0
                        } else 0
                        loadPage(startIndex)
                    }
                    updateProgress()
                } else {
                    Toast.makeText(this@CourseDetailActivity, "Failed to load course detail", Toast.LENGTH_SHORT).show()
                    finish()
                }
            } catch (e: Exception) {
                Log.e("CourseDetailActivity", "Error loading course", e)
                finish()
            }
        }
    }

    private fun loadPage(index: Int) {
        val currentCourse = course ?: return
        val pages = currentCourse.pages
        if (index < 0 || index >= pages.size) return

        currentPageIndex = index
        val page = pages[index]
        adapter.setSelectedIndex(index)
        
        try {
            // Fix status bar appearance (Always LAYOUT_FULLSCREEN to avoid gaps)
            val isDarkMode = (resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES
            
            if (page.contentType == "VIDEO") {
                // Video Lesson: Solid Black Bar, White Text/Icons
                window.statusBarColor = Color.BLACK
                window.decorView.systemUiVisibility = (
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                )
            } else {
                // Article Lesson: Transparent Bar, Adaptive Icons
                window.statusBarColor = Color.TRANSPARENT
                if (!isDarkMode) {
                    window.decorView.systemUiVisibility = (
                        View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                    )
                } else {
                    window.decorView.systemUiVisibility = (
                        View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    )
                }
            }

            if (drawerLayout.isDrawerOpen(android.view.Gravity.START)) {
                drawerLayout.closeDrawer(android.view.Gravity.START)
            }

            // Collapse card if expanded
            if (isCardExpanded) {
                val progressCard = findViewById<ViewGroup>(R.id.progressCard)
                val rvExpandedPages = findViewById<RecyclerView>(R.id.rvExpandedPages)
                toggleCardExpansion(progressCard, rvExpandedPages)
            }

            contentContainer.removeAllViews()
            stickyVideoContainer.removeAllViews()
            stickyVideoContainer.visibility = View.GONE

            // Toggle header visibility based on content type
            val header = findViewById<View>(R.id.tvCourseTitle).parent as View
            header.visibility = if (page.contentType == "VIDEO") View.GONE else View.VISIBLE

            when (page.contentType) {
                "ARTICLE" -> {
                    val container = android.widget.LinearLayout(this).apply {
                        orientation = android.widget.LinearLayout.VERTICAL
                        layoutParams = FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.WRAP_CONTENT
                        )
                    }
                    
                    val publisherView = layoutInflater.inflate(R.layout.layout_publisher_info, container, false)
                    container.addView(publisherView)
                    setupPublisherInfo(publisherView)
                    
                    val articleView = RecyclerView(this).apply {
                        layoutParams = android.widget.LinearLayout.LayoutParams(
                            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                        ).apply {
                            val m = (16 * resources.displayMetrics.density).toInt()
                            setMargins(0, m, 0, m * 2)
                        }
                        isNestedScrollingEnabled = false
                        layoutManager = LinearLayoutManager(this@CourseDetailActivity)
                    }

                    val adapter = MarkwonAdapter.builder(R.layout.adapter_markdown_text, R.id.text)
                        .include(FencedCodeBlock::class.java, object : SimpleEntry(R.layout.adapter_markdown_code_block, R.id.code_text) {
                            override fun bindHolder(markwon: Markwon, holder: SimpleEntry.Holder, node: org.commonmark.node.Node) {
                                super.bindHolder(markwon, holder, node)
                                val isDarkMode = (resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES
                                val codeBg = if (isDarkMode) Color.parseColor("#1e1e1e") else Color.parseColor("#f0f0f0")
                                val textColor = if (isDarkMode) Color.WHITE else Color.BLACK
                                
                                val container = holder.itemView.findViewById<View>(R.id.code_container)
                                container.backgroundTintList = ColorStateList.valueOf(codeBg)
                                
                                val codeText = holder.itemView.findViewById<TextView>(R.id.code_text)
                                codeText.setTextColor(textColor)
                                
                                val btnCopy = holder.itemView.findViewById<View>(R.id.btn_copy)
                                btnCopy.setOnClickListener {
                                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("code", codeText.text)
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(this@CourseDetailActivity, "Code copied", Toast.LENGTH_SHORT).show()
                                }
                            }
                        })
                        .include(IndentedCodeBlock::class.java, object : SimpleEntry(R.layout.adapter_markdown_code_block, R.id.code_text) {
                            override fun bindHolder(markwon: Markwon, holder: SimpleEntry.Holder, node: org.commonmark.node.Node) {
                                super.bindHolder(markwon, holder, node)
                                val isDarkMode = (resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES
                                val codeBg = if (isDarkMode) Color.parseColor("#1e1e1e") else Color.parseColor("#f0f0f0")
                                val textColor = if (isDarkMode) Color.WHITE else Color.BLACK
                                
                                val container = holder.itemView.findViewById<View>(R.id.code_container)
                                container.backgroundTintList = ColorStateList.valueOf(codeBg)
                                
                                val codeText = holder.itemView.findViewById<TextView>(R.id.code_text)
                                codeText.setTextColor(textColor)
                                
                                val btnCopy = holder.itemView.findViewById<View>(R.id.btn_copy)
                                btnCopy.setOnClickListener {
                                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("code", codeText.text)
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(this@CourseDetailActivity, "Code copied", Toast.LENGTH_SHORT).show()
                                }
                            }
                        })
                        .build()
                    articleView.adapter = adapter
                    adapter.setMarkdown(markwon, page.body ?: "")
                    adapter.notifyDataSetChanged()
                    container.addView(articleView)
                    
                    val reactionsView = layoutInflater.inflate(R.layout.layout_page_reactions, container, false)
                    container.addView(reactionsView)
                    setupReactions(reactionsView, page)
                    
                    contentContainer.addView(container)
                }
                "VIDEO" -> {
                    stickyVideoContainer.visibility = View.VISIBLE
                    
                    val videoWebView = WebView(this).apply {
                        layoutParams = FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            (240 * resources.displayMetrics.density).toInt()
                        )
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.mediaPlaybackRequiresUserGesture = false
                        webChromeClient = createWebChromeClient()
                        setBackgroundColor(Color.BLACK)
                    }
                    
                    val videoUrl = page.videoUrl ?: ""
                    val html = if (videoUrl.contains("youtube.com") || videoUrl.contains("youtu.be")) {
                        val videoId = videoUrl.substringAfter("watch?v=").substringAfter("youtu.be/").substringBefore("&")
                        "<html><body style='margin:0;padding:0;background:#000;'><iframe src='https://www.youtube.com/embed/$videoId?autoplay=1&playsinline=1' width='100%' height='100%' frameborder='0' allowfullscreen></iframe></body></html>"
                    } else {
                        "<html><body style='margin:0;padding:0;background:#000;'><video width='100%' height='100%' controls autoplay playsinline><source src='$videoUrl' type='video/mp4'></video></body></html>"
                    }
                    
                    videoWebView.loadDataWithBaseURL("https://www.youtube.com", html, "text/html", "UTF-8", null)
                    stickyVideoContainer.addView(videoWebView)
                    
                    val container = android.widget.LinearLayout(this).apply {
                        orientation = android.widget.LinearLayout.VERTICAL
                        layoutParams = FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.WRAP_CONTENT
                        )
                    }
                    
                    val contentPadding = (16 * resources.displayMetrics.density).toInt()

                    // Info Container for text content (with padding)
                    val infoContainer = android.widget.LinearLayout(this).apply {
                        orientation = android.widget.LinearLayout.VERTICAL
                        layoutParams = android.widget.LinearLayout.LayoutParams(
                            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                        )
                        setPadding(contentPadding, contentPadding, contentPadding, 0)
                    }

                    // Title
                    val titleView = TextView(this).apply {
                        text = page.title
                        textSize = 18f
                        setTextColor(androidx.core.content.ContextCompat.getColor(this@CourseDetailActivity, R.color.foreground))
                        typeface = android.graphics.Typeface.DEFAULT_BOLD
                    }
                    infoContainer.addView(titleView)

                    // Page count / Meta
                    val infoView = TextView(this).apply {
                        text = "Page ${index + 1} of ${pages.size}"
                        textSize = 12f
                        setTextColor(androidx.core.content.ContextCompat.getColor(this@CourseDetailActivity, R.color.muted_foreground))
                        setPadding(0, 4, 0, 12)
                    }
                    infoContainer.addView(infoView)
                    
                    // Publisher Info (YouTube style)
                    val publisherView = layoutInflater.inflate(R.layout.layout_publisher_info, infoContainer, false).apply {
                        setBackgroundColor(Color.TRANSPARENT)
                        setPadding(0, 8, 0, 8)
                    }
                    infoContainer.addView(publisherView)
                    setupPublisherInfo(publisherView)
                    
                    // Reactions
                    val reactionsView = layoutInflater.inflate(R.layout.layout_page_reactions, infoContainer, false).apply {
                        setPadding(0, 12, 0, 12)
                    }
                    infoContainer.addView(reactionsView)
                    setupReactions(reactionsView, page)

                    // Description (Body text if available)
                    if (!page.body.isNullOrBlank()) {
                        val descriptionHeader = TextView(this).apply {
                            text = "Description"
                            textSize = 14f
                            setTextColor(androidx.core.content.ContextCompat.getColor(this@CourseDetailActivity, R.color.foreground))
                            typeface = android.graphics.Typeface.DEFAULT_BOLD
                            setPadding(0, 16, 0, 8)
                        }
                        infoContainer.addView(descriptionHeader)

                        val descriptionView = TextView(this).apply {
                            layoutParams = android.widget.LinearLayout.LayoutParams(
                                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                            ).apply {
                                setMargins(0, 0, 0, (120 * resources.displayMetrics.density).toInt())
                            }
                            setTextColor(androidx.core.content.ContextCompat.getColor(this@CourseDetailActivity, R.color.foreground))
                            textSize = 14f
                            setLineSpacing(3f * resources.displayMetrics.density, 1.1f)
                        }
                        markwon.setMarkdown(descriptionView, page.body)
                        infoContainer.addView(descriptionView)
                    }
                    
                    container.addView(infoContainer)
                    contentContainer.addView(container)
                }
                else -> {
                    val fallback = TextView(this).apply {
                        text = "Content coming soon..."
                        setTextColor(Color.GRAY)
                        textSize = 16f
                        gravity = android.view.Gravity.CENTER
                        val p = (48 * resources.displayMetrics.density).toInt()
                        setPadding(p, p, p, p)
                    }
                    contentContainer.addView(fallback)
                }
            }
            updateButtons()
        } catch (e: Exception) {
            Log.e("CourseDetailActivity", "Error loading page", e)
        }
    }

    private fun createWebChromeClient() = object : android.webkit.WebChromeClient() {
        private var customView: View? = null
        override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
            if (customView != null) { callback?.onCustomViewHidden(); return }
            customView = view
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY)
            requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            (window.decorView as ViewGroup).addView(view, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        }
        override fun onHideCustomView() {
            if (customView == null) return
            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
            requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            (window.decorView as ViewGroup).removeView(customView)
            customView = null
        }
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
            showCompletionConfetti()
        }
    }

    private fun showCompletionConfetti() {
        progressBar.progress = 100
        val lottieConfetti = findViewById<LottieAnimationView>(R.id.lottieConfetti)
        
        // Using a confirmed reliable public Lottie URL for confetti
        lottieConfetti.setAnimationFromUrl("https://assets2.lottiefiles.com/packages/lf20_u4yrau.json")
        lottieConfetti.visibility = View.VISIBLE
        lottieConfetti.bringToFront()
        lottieConfetti.playAnimation()
        
        lottieConfetti.addAnimatorListener(object : Animator.AnimatorListener {
            override fun onAnimationStart(animation: Animator) {
                Log.d("CourseDetailActivity", "Confetti animation started")
            }
            override fun onAnimationEnd(animation: Animator) {
                lottieConfetti.visibility = View.GONE
            }
            override fun onAnimationCancel(animation: Animator) { lottieConfetti.visibility = View.GONE }
            override fun onAnimationRepeat(animation: Animator) {}
        })
        
        lottieConfetti.setFailureListener {
            Log.e("CourseDetailActivity", "Lottie loading failed for confetti", it)
            lottieConfetti.visibility = View.GONE
        }
    }

    private fun markCurrentComplete() {
        val courseId = course?.id ?: return
        val pages = course?.pages ?: return
        val page = pages.getOrNull(currentPageIndex) ?: return
        lifecycleScope.launch {
            AuthApi.markPageComplete(courseId, page.id)
            val updatedPages = pages.toMutableList().apply {
                val p = get(currentPageIndex)
                set(currentPageIndex, p.copy(completed = true))
            }
            course = course?.copy(pages = updatedPages)
            adapter.setPages(updatedPages)
            updateProgress()
        }
    }

    private fun markCurrentIncomplete() {
        val pages = course?.pages ?: return
        val updatedPages = pages.toMutableList().apply {
            val p = get(currentPageIndex)
            set(currentPageIndex, p.copy(completed = false))
        }
        course = course?.copy(pages = updatedPages)
        adapter.setPages(updatedPages)
        updateProgress()
    }

    private fun updateButtons() {
        val pages = course?.pages ?: return
        val isLastPage = currentPageIndex == pages.size - 1
        btnPrevious.alpha = if (currentPageIndex > 0) 1f else 0.3f
        btnPrevious.isEnabled = currentPageIndex > 0
        btnNext.setImageResource(if (isLastPage) R.drawable.ic_checkmark_circle else R.drawable.ic_next)
    }

    private fun updateProgress() {
        val pages = course?.pages ?: return
        val progress = if (pages.isNotEmpty()) (pages.count { it.completed } * 100) / pages.size else 0
        progressBar.progress = progress
    }

    private fun setupPublisherInfo(view: View) {
        val tvAvatar = view.findViewById<TextView>(R.id.tvPublisherAvatar)
        val tvName = view.findViewById<TextView>(R.id.tvPublisherName)
        val btnFollow = view.findViewById<TextView>(R.id.btnFollow)
        val courseTitle = course?.title?.lowercase() ?: ""
        if (courseTitle.contains("learn java for free")) { view.visibility = View.GONE; return }
        course?.publisher?.let { pub ->
            tvAvatar.text = pub.name.firstOrNull()?.uppercase() ?: "?"
            tvName.text = pub.name
            btnFollow.text = if (course?.isFollowing == true) "Following" else "Follow"
            btnFollow.setOnClickListener {
                lifecycleScope.launch {
                    val newState = !(course?.isFollowing ?: false)
                    if (if (newState) AuthApi.followPublisher(course?.id!!) else AuthApi.unfollowPublisher(course?.id!!)) {
                        course = course?.copy(isFollowing = newState)
                        btnFollow.text = if (newState) "Following" else "Follow"
                    }
                }
            }
        } ?: run { view.visibility = View.GONE }
    }

    private fun setupReactions(view: View, page: AuthApi.CoursePage) {
        val btnLike = view.findViewById<View>(R.id.btnLike)
        val btnDislike = view.findViewById<View>(R.id.btnDislike)
        val btnShare = view.findViewById<View>(R.id.btnShare)
        val ivLike = view.findViewById<ImageView>(R.id.ivLike)
        val ivDislike = view.findViewById<ImageView>(R.id.ivDislike)
        val tvLike = view.findViewById<TextView>(R.id.tvLikeCount)
        val tvDislike = view.findViewById<TextView>(R.id.tvDislikeCount)
        
        var current = page.userReaction
        var likes = page.likeCount
        var dislikes = page.dislikeCount

        val activeTint = androidx.core.content.ContextCompat.getColor(this, R.color.primary)
        val inactiveTint = androidx.core.content.ContextCompat.getColor(this, R.color.foreground)
        
        fun update() {
            tvLike.text = likes.toString()
            tvDislike.text = dislikes.toString()
            
            // Subtle theme-consistent active state (primary tint on icon)
            ivLike.imageTintList = android.content.res.ColorStateList.valueOf(if (current == true) activeTint else inactiveTint)
            ivDislike.imageTintList = android.content.res.ColorStateList.valueOf(if (current == false) activeTint else inactiveTint)
            
            btnLike.setBackgroundResource(if (current == true) R.drawable.feedback_glass_btn_active else R.drawable.feedback_glass_btn)
            btnDislike.setBackgroundResource(if (current == false) R.drawable.feedback_glass_btn_active else R.drawable.feedback_glass_btn)
        }
        update()

        btnLike.setOnClickListener {
            lifecycleScope.launch {
                if (current == true) { AuthApi.removeReaction(page.id); likes--; current = null }
                else { AuthApi.reactToPage(page.id, true); if (current == false) dislikes--; likes++; current = true }
                update()
            }
        }

        btnDislike.setOnClickListener {
            lifecycleScope.launch {
                if (current == false) { AuthApi.removeReaction(page.id); dislikes--; current = null }
                else { AuthApi.reactToPage(page.id, false); if (current == true) likes--; dislikes++; current = false }
                update()
            }
        }

        btnShare.setOnClickListener {
            val shareUrl = "https://blazeneuro.com/dashboard/course-viewer?courseId=${course?.id}&pageId=${page.id}"
            val intent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(android.content.Intent.EXTRA_TEXT, "Check out this course: ${course?.title}\n$shareUrl")
            }
            startActivity(android.content.Intent.createChooser(intent, "Share Course"))
        }
    }

    inner class PageAdapter : RecyclerView.Adapter<PageAdapter.ViewHolder>() {
        private var pages = listOf<AuthApi.CoursePage>()
        private var selectedIndex = 0
        fun setPages(newPages: List<AuthApi.CoursePage>) { pages = newPages; notifyDataSetChanged() }
        fun setSelectedIndex(index: Int) { val old = selectedIndex; selectedIndex = index; notifyItemChanged(old); notifyItemChanged(selectedIndex) }
        override fun onCreateViewHolder(p: ViewGroup, t: Int) = ViewHolder(layoutInflater.inflate(R.layout.item_course_page, p, false))
        override fun onBindViewHolder(h: ViewHolder, p: Int) {
            val page = pages[p]
            h.title.text = page.title
            h.icon.setImageResource(if (page.contentType == "VIDEO") R.drawable.ic_play_circle else R.drawable.ic_blogs)
            h.checkmark.visibility = if (page.completed) View.VISIBLE else View.GONE
            h.itemView.alpha = if (p == selectedIndex) 1f else 0.6f
            h.itemView.setOnClickListener { loadPage(p) }
        }
        override fun getItemCount() = pages.size
        inner class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
            val title: TextView = v.findViewById(R.id.tvPageTitle)
            val icon: ImageView = v.findViewById(R.id.ivPageIcon)
            val checkmark: ImageView = v.findViewById(R.id.ivCheckmark)
        }
    }
}
