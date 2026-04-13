package com.blazeneuro

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.drawerlayout.widget.DrawerLayout
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.blazeneuro.location.LocationService
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class HomeActivity : AppCompatActivity() {
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var container: FrameLayout
    private lateinit var navHome: View
    private lateinit var navSearch: View
    private lateinit var navBlogs: View
    private lateinit var navProjects: View
    private lateinit var navProfile: View
    private lateinit var locationService: LocationService

    override fun onCreate(savedInstanceState: Bundle?) {
        applyTheme()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_bottom_nav)
        AuthApi.init(this)
        NotificationManager.init(this)
        checkNotificationPermission()
        
        // Initialize and start location tracking
        locationService = LocationService(this)
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            locationService.startTracking()
        }
        
        // Check for popup
        checkForPopup()
        
        // Set status bar appearance based on theme
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            val nightMode = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
            if (nightMode == android.content.res.Configuration.UI_MODE_NIGHT_NO) {
                // Light mode - dark status bar icons
                window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            }
        }

        drawerLayout = findViewById(R.id.drawerLayout)
        container = findViewById(R.id.fragmentContainer)
        navHome = findViewById(R.id.navHome)
        navSearch = findViewById(R.id.navSearch)
        navBlogs = findViewById(R.id.navBlogs)
        navProjects = findViewById(R.id.navProjects)
        navProfile = findViewById(R.id.navProfile)

        navHome.setOnClickListener { showFragment(HomeFragment(), 0) }
        navSearch.setOnClickListener { showFragment(SearchFragment(), 1) }
        navBlogs.setOnClickListener { showFragment(BlogsFragment(), 2) }
        navProjects.setOnClickListener { showFragment(ProjectsFragment(), 3) }
        navProfile.setOnClickListener { showFragment(ProfileFragment(), 4) }

        setupMenuDrawer()
        
        showFragment(HomeFragment(), 0)
        
        // Fetch notifications immediately on start
        lifecycleScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            android.util.Log.d("HomeActivity", "Initial notification fetch...")
            NotificationManager.fetchNotificationsFromServer(this@HomeActivity)
        }
        
        // Poll every 3 seconds when app is open
        startNotificationPolling()
    }
    
    private fun startNotificationPolling() {
        lifecycleScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            while (true) {
                kotlinx.coroutines.delay(3000) // Poll every 3 seconds
                NotificationManager.fetchNotificationsFromServer(this@HomeActivity)
            }
        }
    }

    private fun showFragment(fragment: Fragment, index: Int) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
        updateNavSelection(index)
        
        // Hide bottom nav for Community
        findViewById<View>(R.id.navHome).parent?.let { parent ->
            (parent.parent as? View)?.visibility = if (index == 3) View.GONE else View.VISIBLE
        }
        
        // Adjust container margin
        container.layoutParams = (container.layoutParams as FrameLayout.LayoutParams).apply {
            bottomMargin = if (index == 3) 0 else resources.getDimensionPixelSize(R.dimen.bottom_nav_height)
        }
    }

    private fun updateNavSelection(index: Int) {
        val icons = listOf(
            findViewById<ImageView>(R.id.navIconHome),
            findViewById<ImageView>(R.id.navIconSearch),
            findViewById<ImageView>(R.id.navIconBlogs),
            findViewById<ImageView>(R.id.navIconProjects),
            findViewById<ImageView>(R.id.navIconProfile)
        )
        val labels = listOf(
            findViewById<TextView>(R.id.navLabelHome),
            findViewById<TextView>(R.id.navLabelSearch),
            findViewById<TextView>(R.id.navLabelBlogs),
            findViewById<TextView>(R.id.navLabelProjects),
            findViewById<TextView>(R.id.navLabelProfile)
        )
        icons.forEachIndexed { i, icon ->
            icon.alpha = if (i == index) 1f else 0.5f
        }
        labels.forEachIndexed { i, label ->
            label.alpha = if (i == index) 1f else 0.5f
        }
    }
    
    fun openDrawer() {
        drawerLayout.openDrawer(android.view.Gravity.START)
    }
    
    fun openNotificationDrawer() {
        drawerLayout.openDrawer(android.view.Gravity.END)
    }
    
    private fun setupMenuDrawer() {
        val drawerMenu = findViewById<View>(R.id.drawerMenu)
        val menuHelp = drawerMenu.findViewById<View>(R.id.menuHelp)
        val menuFeedback = drawerMenu.findViewById<View>(R.id.menuFeedback)
        val menuReport = drawerMenu.findViewById<View>(R.id.menuReport)
        val appVersion = drawerMenu.findViewById<TextView>(R.id.appVersion)
        
        appVersion.text = "Version ${BuildConfig.VERSION_NAME}"
        
        menuHelp.setOnClickListener {
            drawerLayout.closeDrawer(android.view.Gravity.START)
            android.widget.Toast.makeText(this, "Help", android.widget.Toast.LENGTH_SHORT).show()
        }
        
        menuFeedback.setOnClickListener {
            drawerLayout.closeDrawer(android.view.Gravity.START)
            android.widget.Toast.makeText(this, "Feedback", android.widget.Toast.LENGTH_SHORT).show()
        }
        
        menuReport.setOnClickListener {
            drawerLayout.closeDrawer(android.view.Gravity.START)
            android.widget.Toast.makeText(this, "Report", android.widget.Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun checkNotificationPermission() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            val prefs = getSharedPreferences("settings", MODE_PRIVATE)
            val asked = prefs.getBoolean("notification_permission_asked", false)
            
            if (!asked) {
                requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 100)
                prefs.edit().putBoolean("notification_permission_asked", true).apply()
            }
        }
    }
    
    private fun checkForPopup() {
        Log.d("HomeActivity", "checkForPopup called")
        lifecycleScope.launch {
            try {
                val url = "https://blazeneuro.com/api/mobile/popup"
                val request = okhttp3.Request.Builder().url(url).build()
                val response = okhttp3.OkHttpClient().newCall(request).execute()
                val json = org.json.JSONObject(response.body?.string() ?: "{}")
                
                Log.d("HomeActivity", "Popup response: $json")
                
                if (json.has("popup") && !json.isNull("popup")) {
                    val popup = json.getJSONObject("popup")
                    val popupId = popup.getString("id")
                    
                    Log.d("HomeActivity", "Found popup: $popupId")
                    
                    val prefs = getSharedPreferences("popups", MODE_PRIVATE)
                    val shown = prefs.getBoolean(popupId, false)
                    
                    if (!shown) {
                        Log.d("HomeActivity", "Showing popup")
                        runOnUiThread {
                            PopupDialog(this@HomeActivity, popup).show()
                        }
                        prefs.edit().putBoolean(popupId, true).apply()
                    } else {
                        Log.d("HomeActivity", "Popup already shown")
                    }
                } else {
                    Log.d("HomeActivity", "No active popup")
                }
            } catch (e: Exception) {
                Log.e("HomeActivity", "Popup error", e)
            }
        }
    }

    private fun applyTheme() {
        val prefs = getSharedPreferences("settings", MODE_PRIVATE)
        val theme = prefs.getString("theme", "system")
        val mode = when (theme) {
            "light" -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO
            "dark" -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_YES
            else -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        }
        androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(mode)
    }
}

class HomeFragment : Fragment(R.layout.fragment_home) {
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var viewPager: androidx.viewpager2.widget.ViewPager2
    private val topBlogs = mutableListOf<AuthApi.Blog>()
    private var isLoading = true
    private lateinit var notificationBadge: View
    private val notificationListener = { updateNotificationBadge() }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        view.findViewById<TextView>(R.id.tvTitle).text = "Welcome, ${AuthApi.getSavedUserName()}!"
        
        notificationBadge = view.findViewById(R.id.notificationBadge)
        
        view.findViewById<ImageView>(R.id.ivMenu).setOnClickListener {
            (requireActivity() as? HomeActivity)?.openDrawer()
        }
        
        view.findViewById<ImageView>(R.id.ivNotification).setOnClickListener {
            NotificationBottomSheet().show(parentFragmentManager, "notifications")
        }
        
        swipeRefresh = view.findViewById(R.id.swipeRefresh)
        viewPager = view.findViewById(R.id.vpCarousel)
        
        swipeRefresh.setOnRefreshListener {
            loadTopBlogs()
        }
        
        NotificationManager.addListener(notificationListener)
        updateNotificationBadge()
        
        setupCarousel()
        showSkeleton()
        loadTopBlogs()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        NotificationManager.removeListener(notificationListener)
    }
    
    private fun updateNotificationBadge() {
        notificationBadge.visibility = if (NotificationManager.getUnreadCount() > 0) View.VISIBLE else View.GONE
    }
    
    private fun showSkeleton() {
        topBlogs.clear()
        topBlogs.add(AuthApi.Blog("", "", "", "", "", 0, null, "", "", null, 0, 0, 0))
        topBlogs.add(AuthApi.Blog("", "", "", "", "", 0, null, "", "", null, 0, 0, 0))
        topBlogs.add(AuthApi.Blog("", "", "", "", "", 0, null, "", "", null, 0, 0, 0))
        viewPager.adapter?.notifyDataSetChanged()
    }
    
    private fun setupCarousel() {
        val adapter = CarouselAdapter(topBlogs, isLoading) { blog ->
            if (!isLoading) {
                val intent = Intent(requireContext(), BlogDetailActivity::class.java).apply {
                    putExtra("slug", blog.slug)
                }
                startActivity(intent)
            }
        }
        viewPager.adapter = adapter
        viewPager.offscreenPageLimit = 1
        
        // Start at a high position to allow infinite scrolling
        if (!isLoading && topBlogs.isNotEmpty()) {
            val startPosition = Int.MAX_VALUE / 2
            viewPager.setCurrentItem(startPosition - (startPosition % topBlogs.size), false)
        }
        
        val pageMargin = resources.getDimensionPixelOffset(R.dimen.space_md)
        viewPager.setPageTransformer { page, position ->
            page.translationX = -pageMargin * position
            page.scaleY = 1 - (0.15f * kotlin.math.abs(position))
            page.alpha = 0.5f + (1 - kotlin.math.abs(position)) * 0.5f
        }
        
        setupDots()
        startAutoScroll()
    }
    
    private fun startAutoScroll() {
        lifecycleScope.launch {
            while (true) {
                kotlinx.coroutines.delay(4000)
                if (!isLoading && topBlogs.isNotEmpty()) {
                    val currentItem = viewPager.currentItem
                    viewPager.setCurrentItem(currentItem + 1, true)
                }
            }
        }
    }
    
    private fun setupDots() {
        viewPager.registerOnPageChangeCallback(object : androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                if (!isLoading) updateDots(position % topBlogs.size)
            }
        })
    }
    
    private fun updateDots(position: Int) {
        val dotsLayout = view?.findViewById<android.widget.LinearLayout>(R.id.dotsIndicator) ?: return
        dotsLayout.removeAllViews()
        
        for (i in topBlogs.indices) {
            val dot = View(context).apply {
                layoutParams = android.widget.LinearLayout.LayoutParams(
                    if (i == position) 24 else 16,
                    if (i == position) 24 else 16
                ).apply {
                    setMargins(8, 0, 8, 0)
                }
                background = resources.getDrawable(
                    if (i == position) R.drawable.dot_active else R.drawable.dot_inactive,
                    null
                )
            }
            dotsLayout.addView(dot)
        }
    }
    
    private fun loadTopBlogs() {
        lifecycleScope.launch {
            try {
                val blogs = AuthApi.getTopBlogs()
                isLoading = false
                topBlogs.clear()
                topBlogs.addAll(blogs)
                (viewPager.adapter as? CarouselAdapter)?.setLoading(false)
                viewPager.adapter?.notifyDataSetChanged()
                
                // Set to middle position for infinite scroll
                if (topBlogs.isNotEmpty()) {
                    val startPosition = Int.MAX_VALUE / 2
                    viewPager.setCurrentItem(startPosition - (startPosition % topBlogs.size), false)
                }
                
                updateDots(0)
                swipeRefresh.isRefreshing = false
            } catch (e: Exception) {
                isLoading = false
                swipeRefresh.isRefreshing = false
            }
        }
    }
}

class CarouselAdapter(
    private val blogs: List<AuthApi.Blog>,
    private var isLoading: Boolean = true,
    private val onClick: (AuthApi.Blog) -> Unit
) : RecyclerView.Adapter<CarouselAdapter.ViewHolder>() {

    fun setLoading(loading: Boolean) {
        isLoading = loading
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivCover: ImageView = view.findViewById(R.id.ivCover)
        val tvTitle: TextView = view.findViewById(R.id.tvTitle)
        val tvLikes: TextView = view.findViewById(R.id.tvLikes)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_carousel, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        if (isLoading || blogs.isEmpty()) {
            holder.ivCover.setImageDrawable(null)
            holder.ivCover.setBackgroundResource(R.drawable.skeleton_shimmer)
            (holder.ivCover.background as? android.graphics.drawable.AnimationDrawable)?.start()
            
            holder.tvTitle.text = ""
            holder.tvTitle.setBackgroundResource(R.drawable.skeleton_shimmer)
            (holder.tvTitle.background as? android.graphics.drawable.AnimationDrawable)?.start()
            
            holder.tvLikes.text = ""
            holder.tvLikes.setBackgroundResource(R.drawable.skeleton_shimmer)
            (holder.tvLikes.background as? android.graphics.drawable.AnimationDrawable)?.start()
            return
        }
        
        val actualPosition = position % blogs.size
        val blog = blogs[actualPosition]
        holder.ivCover.background = null
        holder.tvTitle.background = null
        holder.tvLikes.background = null
        
        val titleWithPrefix = android.text.SpannableStringBuilder()
        val hashSpan = android.text.SpannableString("# ")
        hashSpan.setSpan(
            android.text.style.ForegroundColorSpan(
                ContextCompat.getColor(holder.itemView.context, R.color.muted_foreground)
            ),
            0,
            2,
            android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )
        hashSpan.setSpan(
            android.text.style.StyleSpan(android.graphics.Typeface.BOLD),
            0,
            1,
            android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )
        titleWithPrefix.append(hashSpan)
        titleWithPrefix.append(blog.title)
        holder.tvTitle.text = titleWithPrefix
        holder.tvLikes.text = formatCount(blog.likeCount)
        
        if (!blog.coverImage.isNullOrEmpty()) {
            com.bumptech.glide.Glide.with(holder.ivCover)
                .load(blog.coverImage)
                .transform(
                    com.bumptech.glide.load.resource.bitmap.CenterCrop(),
                    com.bumptech.glide.load.resource.bitmap.RoundedCorners(32)
                )
                .into(holder.ivCover)
        } else {
            holder.ivCover.setImageDrawable(null)
        }
        
        holder.itemView.setOnClickListener { onClick(blog) }
    }

    override fun getItemCount() = if (isLoading || blogs.isEmpty()) blogs.size else Int.MAX_VALUE
    
    private fun formatCount(count: Int): String {
        return when {
            count >= 1000000 -> String.format("%.1fM", count / 1000000.0)
            count >= 1000 -> String.format("%.1fK", count / 1000.0)
            else -> count.toString()
        }
    }
}

class SearchFragment : Fragment(R.layout.fragment_search) {
    private lateinit var etSearch: EditText
    private lateinit var rvResults: RecyclerView
    private lateinit var rvTrending: RecyclerView
    private lateinit var tvTrendingTitle: TextView
    private val results = mutableListOf<AuthApi.SearchResult>()
    private val trending = mutableListOf<String>()
    private lateinit var adapter: SearchAdapter
    private lateinit var trendingAdapter: TrendingAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        etSearch = view.findViewById(R.id.etSearch)
        rvResults = view.findViewById(R.id.rvSearchResults)
        rvTrending = view.findViewById(R.id.rvTrending)
        tvTrendingTitle = view.findViewById(R.id.tvTrendingTitle)
        
        adapter = SearchAdapter(results)
        rvResults.layoutManager = LinearLayoutManager(context)
        rvResults.adapter = adapter

        trendingAdapter = TrendingAdapter(trending) { query ->
            etSearch.setText(query)
        }
        rvTrending.layoutManager = androidx.recyclerview.widget.GridLayoutManager(context, 2)
        rvTrending.adapter = trendingAdapter

        loadTrending()

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val query = s.toString()
                if (query.length >= 2) {
                    tvTrendingTitle.visibility = View.GONE
                    rvTrending.visibility = View.GONE
                    lifecycleScope.launch {
                        delay(300)
                        searchBlogs(query)
                    }
                } else {
                    results.clear()
                    adapter.notifyDataSetChanged()
                    tvTrendingTitle.visibility = View.VISIBLE
                    rvTrending.visibility = View.VISIBLE
                }
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
    }

    private fun loadTrending() {
        lifecycleScope.launch {
            try {
                val trendingResults = AuthApi.getTrendingSearches()
                trending.clear()
                trending.addAll(trendingResults)
                trendingAdapter.notifyDataSetChanged()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private suspend fun searchBlogs(query: String) {
        val searchResults = AuthApi.searchBlogs(query)
        results.clear()
        results.addAll(searchResults)
        adapter.notifyDataSetChanged()
    }
}

class TrendingAdapter(
    private val items: List<String>,
    private val onClick: (String) -> Unit
) : RecyclerView.Adapter<TrendingAdapter.ViewHolder>() {
    
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvChip: TextView = view.findViewById(R.id.tvChip)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_trending_chip, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.tvChip.text = item
        holder.itemView.setOnClickListener { onClick(item) }
    }

    override fun getItemCount() = items.size
}

class SearchAdapter(private val results: List<AuthApi.SearchResult>) : RecyclerView.Adapter<SearchAdapter.ViewHolder>() {
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivIcon: ImageView = view.findViewById(R.id.ivIcon)
        val tvTitle: TextView = view.findViewById(R.id.tvTitle)
        val tvDescription: TextView = view.findViewById(R.id.tvDescription)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_search_result, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val result = results[position]
        holder.tvTitle.text = result.title
        
        if (!result.description.isNullOrEmpty()) {
            holder.tvDescription.text = result.description
            holder.tvDescription.visibility = View.VISIBLE
        } else {
            holder.tvDescription.visibility = View.GONE
        }
        
        holder.itemView.setOnClickListener {
            val intent = Intent(holder.itemView.context, BlogDetailActivity::class.java).apply {
                putExtra("slug", result.slug)
                putExtra("title", result.title)
            }
            holder.itemView.context.startActivity(intent)
        }
    }

    override fun getItemCount() = results.size
}
class BlogsFragment : Fragment(R.layout.fragment_blogs) {
    private lateinit var rvBlogs: RecyclerView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private val blogs = mutableListOf<AuthApi.Blog>()
    private lateinit var adapter: BlogAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        rvBlogs = view.findViewById(R.id.rvBlogs)
        swipeRefresh = view.findViewById(R.id.swipeRefresh)
        adapter = BlogAdapter(blogs)
        rvBlogs.layoutManager = LinearLayoutManager(context)
        rvBlogs.adapter = adapter
        
        swipeRefresh.setOnRefreshListener {
            loadBlogs()
        }
        
        // Load blogs immediately
        swipeRefresh.isRefreshing = true
        loadBlogs()
    }

    private fun loadBlogs() {
        lifecycleScope.launch {
            try {
                val result = AuthApi.getBlogs()
                android.util.Log.d("BlogsFragment", "Loaded ${result.size} blogs")
                blogs.clear()
                blogs.addAll(result)
                adapter.notifyDataSetChanged()
            } catch (e: Exception) {
                android.util.Log.e("BlogsFragment", "Error loading blogs", e)
            } finally {
                swipeRefresh.isRefreshing = false
            }
        }
    }
}

class BlogAdapter(private val blogs: List<AuthApi.Blog>) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    companion object {
        const val TYPE_HERO = 0
        const val TYPE_NORMAL = 1
    }
    
    class HeroViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivCover: ImageView = view.findViewById(R.id.ivHeroCover)
        val tvTitle: TextView = view.findViewById(R.id.tvHeroTitle)
        val tvDesc: TextView = view.findViewById(R.id.tvHeroDesc)
    }
    
    class NormalViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivCover: ImageView = view.findViewById(R.id.ivCover)
        val tvTitle: TextView = view.findViewById(R.id.tvBlogTitle)
        val tvDesc: TextView = view.findViewById(R.id.tvBlogDesc)
    }

    override fun getItemViewType(position: Int): Int {
        return if (position == 0) TYPE_HERO else TYPE_NORMAL
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == TYPE_HERO) {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_hero_blog, parent, false)
            HeroViewHolder(view)
        } else {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_blog, parent, false)
            NormalViewHolder(view)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val blog = blogs[position]
        
        when (holder) {
            is HeroViewHolder -> {
                holder.tvTitle.text = blog.title
                holder.tvDesc.text = blog.description ?: "${blog.readTime} min read"
                
                holder.ivCover.setBackgroundResource(R.drawable.skeleton_shimmer)
                (holder.ivCover.background as? android.graphics.drawable.AnimationDrawable)?.start()
                
                if (!blog.coverImage.isNullOrEmpty()) {
                    com.bumptech.glide.Glide.with(holder.itemView.context)
                        .load(blog.coverImage)
                        .listener(object : com.bumptech.glide.request.RequestListener<android.graphics.drawable.Drawable> {
                            override fun onLoadFailed(e: com.bumptech.glide.load.engine.GlideException?, model: Any?, target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>, isFirstResource: Boolean): Boolean {
                                holder.ivCover.setBackgroundResource(R.drawable.skeleton_bg)
                                return false
                            }
                            override fun onResourceReady(resource: android.graphics.drawable.Drawable, model: Any, target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>, dataSource: com.bumptech.glide.load.DataSource, isFirstResource: Boolean): Boolean {
                                holder.ivCover.background = null
                                return false
                            }
                        })
                        .into(holder.ivCover)
                }
                
                holder.itemView.setOnClickListener {
                    val intent = Intent(holder.itemView.context, BlogDetailActivity::class.java).apply {
                        putExtra("slug", blog.slug)
                        putExtra("title", blog.title)
                        putExtra("description", blog.description)
                    }
                    holder.itemView.context.startActivity(intent)
                }
            }
            is NormalViewHolder -> {
                holder.tvTitle.text = blog.title
                holder.tvDesc.text = blog.description ?: "${blog.readTime} min read"
                
                holder.ivCover.setBackgroundResource(R.drawable.skeleton_shimmer)
                (holder.ivCover.background as? android.graphics.drawable.AnimationDrawable)?.start()
                
                if (!blog.coverImage.isNullOrEmpty()) {
                    com.bumptech.glide.Glide.with(holder.itemView.context)
                        .load(blog.coverImage)
                        .listener(object : com.bumptech.glide.request.RequestListener<android.graphics.drawable.Drawable> {
                            override fun onLoadFailed(e: com.bumptech.glide.load.engine.GlideException?, model: Any?, target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>, isFirstResource: Boolean): Boolean {
                                holder.ivCover.setBackgroundResource(R.drawable.skeleton_bg)
                                return false
                            }
                            override fun onResourceReady(resource: android.graphics.drawable.Drawable, model: Any, target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>, dataSource: com.bumptech.glide.load.DataSource, isFirstResource: Boolean): Boolean {
                                holder.ivCover.background = null
                                return false
                            }
                        })
                        .into(holder.ivCover)
                }
                
                holder.itemView.setOnClickListener {
                    val intent = Intent(holder.itemView.context, BlogDetailActivity::class.java).apply {
                        putExtra("slug", blog.slug)
                        putExtra("title", blog.title)
                        putExtra("description", blog.description)
                    }
                    holder.itemView.context.startActivity(intent)
                }
            }
        }
    }

    override fun getItemCount() = blogs.size
}
class ProjectsFragment : Fragment(R.layout.fragment_projects) {
    private lateinit var rvPosts: RecyclerView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var etMessage: EditText
    private lateinit var replyBar: View
    private lateinit var tvReplyTo: TextView
    private val posts = mutableListOf<CommunityPost>()
    private lateinit var adapter: CommunityAdapter
    private var replyingTo: CommunityPost? = null
    private var pollingJob: kotlinx.coroutines.Job? = null
    private lateinit var prefs: android.content.SharedPreferences
    private lateinit var mentionPopup: android.widget.PopupWindow
    private val userSuggestions = mutableListOf<String>()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        prefs = requireContext().getSharedPreferences("community_cache", android.content.Context.MODE_PRIVATE)
        
        view.findViewById<ImageView>(R.id.ivBack).setOnClickListener {
            (activity as? HomeActivity)?.let { homeActivity ->
                homeActivity.supportFragmentManager.beginTransaction()
                    .replace(R.id.fragmentContainer, HomeFragment())
                    .commit()
                homeActivity.findViewById<View>(R.id.navHome).performClick()
            }
        }
        
        rvPosts = view.findViewById(R.id.rvPosts)
        swipeRefresh = view.findViewById(R.id.swipeRefresh)
        etMessage = view.findViewById(R.id.etMessage)
        replyBar = view.findViewById(R.id.replyBar)
        tvReplyTo = view.findViewById(R.id.tvReplyTo)
        
        setupMentionAutocomplete()
        
        adapter = CommunityAdapter(posts, { post ->
            replyingTo = post
            replyBar.visibility = View.VISIBLE
            tvReplyTo.text = "Replying to u/${post.author}"
            etMessage.requestFocus()
        }, { saveToCache() })
        rvPosts.layoutManager = LinearLayoutManager(context)
        rvPosts.adapter = adapter
        
        swipeRefresh.setOnRefreshListener {
            loadPosts()
        }
        
        view.findViewById<ImageView>(R.id.btnCancelReply).setOnClickListener {
            replyingTo = null
            replyBar.visibility = View.GONE
        }
        
        view.findViewById<View>(R.id.btnSend).setOnClickListener {
            val message = etMessage.text.toString().trim()
            if (message.isNotEmpty()) {
                sendMessage(message)
                etMessage.text.clear()
            }
        }
        
        loadFromCache()
        loadPosts()
        startPolling()
    }
    
    private fun setupMentionAutocomplete() {
        etMessage.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                val text = s.toString()
                val cursorPos = etMessage.selectionStart
                
                // Find @ before cursor
                val lastAt = text.lastIndexOf('@', cursorPos - 1)
                if (lastAt != -1 && (lastAt == 0 || text[lastAt - 1].isWhitespace())) {
                    val query = text.substring(lastAt + 1, cursorPos)
                    if (!query.contains(' ')) {
                        showMentionSuggestions(query, lastAt)
                        return
                    }
                }
                dismissMentionPopup()
            }
        })
    }
    
    private fun showMentionSuggestions(query: String, atPosition: Int) {
        val filtered = userSuggestions.filter { it.contains(query, ignoreCase = true) }.take(5)
        if (filtered.isEmpty()) {
            dismissMentionPopup()
            return
        }
        
        val container = android.widget.LinearLayout(requireContext()).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setBackgroundResource(R.drawable.card_background)
            elevation = 8f
            setPadding(0, 16, 0, 16)
        }
        
        val listView = RecyclerView(requireContext()).apply {
            layoutManager = LinearLayoutManager(context)
            adapter = MentionAdapter(filtered) { username ->
                insertMention(username, atPosition)
                dismissMentionPopup()
            }
            overScrollMode = View.OVER_SCROLL_NEVER
        }
        
        container.addView(listView)
        
        if (!::mentionPopup.isInitialized || !mentionPopup.isShowing) {
            mentionPopup = android.widget.PopupWindow(
                container,
                etMessage.width,
                android.view.ViewGroup.LayoutParams.WRAP_CONTENT,
                true
            )
            mentionPopup.elevation = 12f
            mentionPopup.inputMethodMode = android.widget.PopupWindow.INPUT_METHOD_NOT_NEEDED
            mentionPopup.softInputMode = android.view.WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        } else {
            mentionPopup.contentView = container
        }
        
        mentionPopup.showAsDropDown(etMessage, 0, -etMessage.height - 8)
    }
    
    private fun insertMention(username: String, atPosition: Int) {
        val text = etMessage.text.toString()
        val cursorPos = etMessage.selectionStart
        val before = text.substring(0, atPosition)
        val after = text.substring(cursorPos)
        etMessage.setText("$before@$username $after")
        etMessage.setSelection(before.length + username.length + 2)
    }
    
    private fun dismissMentionPopup() {
        if (::mentionPopup.isInitialized && mentionPopup.isShowing) {
            mentionPopup.dismiss()
        }
    }
    
    private fun loadFromCache() {
        try {
            val cached = prefs.getString("posts", null)
            if (cached != null) {
                val jsonArray = org.json.JSONArray(cached)
                val cachedPosts = (0 until jsonArray.length()).map { i ->
                    val obj = jsonArray.getJSONObject(i)
                    val repliesArray = obj.optJSONArray("replies") ?: org.json.JSONArray()
                    val replies = (0 until repliesArray.length()).map { j ->
                        val r = repliesArray.getJSONObject(j)
                        CommunityPost(
                            id = r.getString("id"),
                            author = r.getString("author"),
                            message = r.getString("message"),
                            time = r.getString("time"),
                            likes = r.getInt("likes"),
                            dislikes = r.getInt("dislikes"),
                            isReply = true
                        )
                    }.toMutableList()
                    
                    CommunityPost(
                        id = obj.getString("id"),
                        author = obj.getString("author"),
                        message = obj.getString("message"),
                        time = obj.getString("time"),
                        likes = obj.getInt("likes"),
                        dislikes = obj.getInt("dislikes"),
                        replies = replies
                    )
                }
                posts.clear()
                posts.addAll(cachedPosts)
                adapter.refresh()
            }
        } catch (e: Exception) {
            android.util.Log.e("ProjectsFragment", "Error loading cache", e)
        }
    }
    
    private fun saveToCache() {
        try {
            val jsonArray = org.json.JSONArray()
            posts.forEach { post ->
                val obj = org.json.JSONObject().apply {
                    put("id", post.id)
                    put("author", post.author)
                    put("message", post.message)
                    put("time", post.time)
                    put("likes", post.likes)
                    put("dislikes", post.dislikes)
                    
                    val repliesArray = org.json.JSONArray()
                    post.replies.forEach { reply ->
                        repliesArray.put(org.json.JSONObject().apply {
                            put("id", reply.id)
                            put("author", reply.author)
                            put("message", reply.message)
                            put("time", reply.time)
                            put("likes", reply.likes)
                            put("dislikes", reply.dislikes)
                        })
                    }
                    put("replies", repliesArray)
                }
                jsonArray.put(obj)
            }
            prefs.edit().putString("posts", jsonArray.toString()).apply()
        } catch (e: Exception) {
            android.util.Log.e("ProjectsFragment", "Error saving cache", e)
        }
    }
    
    private fun startPolling() {
        pollingJob = lifecycleScope.launch {
            while (true) {
                delay(2000)
                loadPosts(silent = true)
            }
        }
    }
    
    private fun sendMessage(message: String) {
        lifecycleScope.launch {
            try {
                val userId = AuthApi.getSavedUserId() ?: return@launch
                val userName = AuthApi.getSavedUserName()
                
                // Detect mentions
                val mentions = NotificationManager.extractMentions(message)
                mentions.forEach { mentionedUser ->
                    if (mentionedUser != userName) {
                        NotificationManager.addNotification(
                            AppNotification(
                                id = java.util.UUID.randomUUID().toString(),
                                type = "mention",
                                fromUser = userName,
                                message = message,
                                postId = "",
                                timestamp = System.currentTimeMillis()
                            )
                        )
                    }
                }
                
                // If replying, notify the original author
                if (replyingTo != null && replyingTo!!.author != userName) {
                    NotificationManager.addNotification(
                        AppNotification(
                            id = java.util.UUID.randomUUID().toString(),
                            type = "reply",
                            fromUser = userName,
                            message = message,
                            postId = replyingTo!!.id,
                            timestamp = System.currentTimeMillis()
                        )
                    )
                }
                
                // Optimistic UI update
                val tempPost = CommunityPost(
                    id = "temp_${System.currentTimeMillis()}",
                    author = userName,
                    message = message,
                    time = "Just now",
                    likes = 0,
                    dislikes = 0,
                    isReply = replyingTo != null
                )
                
                if (replyingTo != null) {
                    posts.find { it.id == replyingTo!!.id }?.replies?.add(tempPost)
                    adapter.refresh()
                } else {
                    posts.add(0, tempPost)
                    adapter.refresh()
                    rvPosts.scrollToPosition(0)
                }
                
                saveToCache()
                
                val newPost = CommunityApi.createPost(userId, message, replyingTo?.id)
                
                if (newPost != null) {
                    replyBar.visibility = View.GONE
                    replyingTo = null
                    // Reload to get real data
                    delay(500)
                    loadPosts(silent = true)
                }
            } catch (e: Exception) {
                android.util.Log.e("ProjectsFragment", "Error sending message", e)
            }
        }
    }
    
    private fun loadPosts(silent: Boolean = false) {
        lifecycleScope.launch {
            try {
                val loadedPosts = CommunityApi.getPosts()
                posts.clear()
                posts.addAll(loadedPosts)
                
                // Extract unique usernames
                userSuggestions.clear()
                userSuggestions.addAll(posts.map { it.author }.distinct())
                posts.forEach { post ->
                    userSuggestions.addAll(post.replies.map { it.author })
                }
                userSuggestions.distinct()
                
                adapter.refresh()
                saveToCache()
            } catch (e: Exception) {
                if (!silent) android.util.Log.e("ProjectsFragment", "Error loading posts", e)
            } finally {
                if (!silent) swipeRefresh.isRefreshing = false
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        pollingJob?.cancel()
    }
}

data class CommunityPost(
    val id: String,
    val author: String,
    val message: String,
    val time: String,
    var likes: Int,
    var dislikes: Int,
    val replies: MutableList<CommunityPost> = mutableListOf(),
    val isReply: Boolean = false
)

class CommunityAdapter(
    private val posts: List<CommunityPost>,
    private val onReply: (CommunityPost) -> Unit = {},
    private val saveToCache: () -> Unit = {}
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    
    companion object {
        const val TYPE_POST = 0
        const val TYPE_REPLY = 1
    }
    
    private val flatList = mutableListOf<Pair<CommunityPost, Boolean>>()
    
    init {
        updateFlatList()
    }
    
    private fun updateFlatList() {
        flatList.clear()
        posts.forEach { post ->
            flatList.add(Pair(post, false))
            post.replies.forEach { reply ->
                flatList.add(Pair(reply, true))
            }
        }
    }
    
    override fun getItemViewType(position: Int) = if (flatList[position].second) TYPE_REPLY else TYPE_POST
    
    class PostViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvAuthor: TextView = view.findViewById(R.id.tvAuthor)
        val tvTime: TextView = view.findViewById(R.id.tvTime)
        val tvMessage: TextView = view.findViewById(R.id.tvMessage)
        val tvVotes: TextView = view.findViewById(R.id.tvVotes)
        val tvReplies: TextView = view.findViewById(R.id.tvReplies)
        val ivUpvote: ImageView = view.findViewById(R.id.ivUpvote)
        val ivDownvote: ImageView = view.findViewById(R.id.ivDownvote)
        val btnReply: View = view.findViewById(R.id.btnReply)
        val btnShare: View = view.findViewById(R.id.btnShare)
    }
    
    class ReplyViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvAuthor: TextView = view.findViewById(R.id.tvAuthor)
        val tvTime: TextView = view.findViewById(R.id.tvTime)
        val tvMessage: TextView = view.findViewById(R.id.tvMessage)
        val tvVotes: TextView = view.findViewById(R.id.tvVotes)
        val ivUpvote: ImageView = view.findViewById(R.id.ivUpvote)
        val ivDownvote: ImageView = view.findViewById(R.id.ivDownvote)
        val btnReply: TextView = view.findViewById(R.id.btnReply)
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == TYPE_POST) {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_community_post, parent, false)
            PostViewHolder(view)
        } else {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_community_reply, parent, false)
            ReplyViewHolder(view)
        }
    }
    
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val (post, isReply) = flatList[position]
        
        if (holder is PostViewHolder) {
            holder.tvAuthor.text = "u/${post.author}"
            holder.tvTime.text = post.time
            holder.tvMessage.text = post.message
            
            val votes = post.likes - post.dislikes
            holder.tvVotes.text = when {
                votes >= 1000 -> String.format("%.1fk", votes / 1000.0)
                else -> votes.toString()
            }
            
            holder.tvReplies.text = if (post.replies.size == 1) "1 reply" else "${post.replies.size} replies"
            
            holder.ivUpvote.setOnClickListener {
                post.likes++
                holder.tvVotes.text = (post.likes - post.dislikes).toString()
                saveToCache()
                kotlinx.coroutines.GlobalScope.launch {
                    CommunityApi.likePost(post.id, "like")
                }
            }
            
            holder.ivDownvote.setOnClickListener {
                post.dislikes++
                holder.tvVotes.text = (post.likes - post.dislikes).toString()
                saveToCache()
                kotlinx.coroutines.GlobalScope.launch {
                    CommunityApi.likePost(post.id, "dislike")
                }
            }
            
            holder.btnReply.setOnClickListener {
                onReply(post)
            }
            
            holder.btnShare.setOnClickListener {
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, post.message)
                }
                holder.itemView.context.startActivity(Intent.createChooser(intent, "Share post"))
            }
        } else if (holder is ReplyViewHolder) {
            holder.tvAuthor.text = "u/${post.author}"
            holder.tvTime.text = post.time
            holder.tvMessage.text = post.message
            
            val votes = post.likes - post.dislikes
            holder.tvVotes.text = votes.toString()
            
            holder.ivUpvote.setOnClickListener {
                post.likes++
                holder.tvVotes.text = (post.likes - post.dislikes).toString()
                saveToCache()
                kotlinx.coroutines.GlobalScope.launch {
                    CommunityApi.likePost(post.id, "like")
                }
            }
            
            holder.ivDownvote.setOnClickListener {
                post.dislikes++
                holder.tvVotes.text = (post.likes - post.dislikes).toString()
                saveToCache()
                kotlinx.coroutines.GlobalScope.launch {
                    CommunityApi.likePost(post.id, "dislike")
                }
            }
            
            holder.btnReply.setOnClickListener {
                android.widget.Toast.makeText(holder.itemView.context, "Reply to reply coming soon", android.widget.Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    override fun getItemCount() = flatList.size
    
    fun refresh() {
        updateFlatList()
        notifyDataSetChanged()
    }
}

class ProfileFragment : Fragment(R.layout.fragment_profile) {
    private val downloads = mutableListOf<DownloadedBlog>()
    private lateinit var adapter: DownloadsAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        view.findViewById<TextView>(R.id.tvUserName).text = AuthApi.getSavedUserName()
        view.findViewById<TextView>(R.id.tvUserEmail).text = AuthApi.getSavedUserEmail()
        
        // Theme switcher
        val prefs = requireContext().getSharedPreferences("settings", android.content.Context.MODE_PRIVATE)
        val currentTheme = prefs.getString("theme", "system") ?: "system"
        
        when (currentTheme) {
            "light" -> view.findViewById<android.widget.RadioButton>(R.id.rbLight).isChecked = true
            "dark" -> view.findViewById<android.widget.RadioButton>(R.id.rbDark).isChecked = true
            else -> view.findViewById<android.widget.RadioButton>(R.id.rbSystem).isChecked = true
        }
        
        view.findViewById<android.widget.RadioGroup>(R.id.rgTheme).setOnCheckedChangeListener { _, checkedId ->
            val theme = when (checkedId) {
                R.id.rbLight -> "light"
                R.id.rbDark -> "dark"
                else -> "system"
            }
            prefs.edit().putString("theme", theme).apply()
            
            // Apply theme immediately and recreate activity
            val mode = when (theme) {
                "light" -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO
                "dark" -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_YES
                else -> androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
            }
            activity?.let {
                androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(mode)
            }
        }
        
        // Downloads
        val rvDownloads = view.findViewById<RecyclerView>(R.id.rvDownloads)
        adapter = DownloadsAdapter(downloads) { blog -> openDownloadedBlog(blog) }
        rvDownloads.layoutManager = LinearLayoutManager(context)
        rvDownloads.adapter = adapter
        
        loadDownloads()
        
        view.findViewById<View>(R.id.btnLogout).setOnClickListener {
            (activity as? HomeActivity)?.let { act ->
                act.lifecycleScope.launch {
                    AuthApi.signOut()
                    act.startActivity(Intent(act, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    })
                    act.finish()
                }
            }
        }
    }
    
    private fun loadDownloads() {
        val files = requireContext().filesDir.listFiles { file -> file.name.startsWith("blog_") }
        downloads.clear()
        files?.forEach { file ->
            val content = file.readText()
            val lines = content.split("\n")
            if (lines.size >= 3) {
                downloads.add(DownloadedBlog(
                    id = file.name.removePrefix("blog_").removeSuffix(".txt"),
                    title = lines[0],
                    author = lines[2].removePrefix("By "),
                    file = file
                ))
            }
        }
        adapter.notifyDataSetChanged()
        view?.findViewById<View>(R.id.tvNoDownloads)?.visibility = 
            if (downloads.isEmpty()) View.VISIBLE else View.GONE
    }
    
    private fun openDownloadedBlog(blog: DownloadedBlog) {
        val intent = Intent(requireContext(), BlogDetailActivity::class.java).apply {
            putExtra("slug", blog.id)
            putExtra("title", blog.title)
            putExtra("offline", true)
        }
        startActivity(intent)
    }
}

data class DownloadedBlog(
    val id: String,
    val title: String,
    val author: String,
    val file: java.io.File
)

class DownloadsAdapter(
    private val downloads: List<DownloadedBlog>,
    private val onClick: (DownloadedBlog) -> Unit
) : RecyclerView.Adapter<DownloadsAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle: TextView = view.findViewById(R.id.tvTitle)
        val tvAuthor: TextView = view.findViewById(R.id.tvAuthor)
        val btnDelete: ImageView = view.findViewById(R.id.btnDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_download, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val blog = downloads[position]
        holder.tvTitle.text = blog.title
        holder.tvAuthor.text = blog.author
        holder.itemView.setOnClickListener { onClick(blog) }
        holder.btnDelete.setOnClickListener {
            blog.file.delete()
            (downloads as MutableList).removeAt(position)
            notifyItemRemoved(position)
        }
    }

    override fun getItemCount() = downloads.size
}


class NotificationBottomSheet : com.google.android.material.bottomsheet.BottomSheetDialogFragment() {
    private lateinit var rvNotifications: RecyclerView
    private lateinit var tvEmpty: TextView
    private val notifications = mutableListOf<AppNotification>()
    private lateinit var adapter: NotificationAdapter
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.bottom_sheet_notifications, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        rvNotifications = view.findViewById(R.id.rvNotifications)
        tvEmpty = view.findViewById(R.id.tvEmpty)
        
        adapter = NotificationAdapter(notifications) { notification ->
            NotificationManager.markAsRead(notification.id)
            dismiss()
        }
        rvNotifications.layoutManager = LinearLayoutManager(context)
        rvNotifications.adapter = adapter
        
        loadNotifications()
        
        dialog?.window?.setBackgroundDrawableResource(android.R.color.transparent)
        
        view.post {
            val parent = view.parent as? View
            parent?.setBackgroundResource(android.R.color.transparent)
            
            val bottomSheet = dialog?.findViewById<View>(com.google.android.material.R.id.design_bottom_sheet)
            bottomSheet?.setBackgroundResource(android.R.color.transparent)
            
            val behavior = com.google.android.material.bottomsheet.BottomSheetBehavior.from(bottomSheet!!)
            val screenHeight = resources.displayMetrics.heightPixels
            val desiredHeight = (screenHeight * 0.7).toInt()
            
            view.layoutParams.height = desiredHeight
            view.requestLayout()
            
            behavior.peekHeight = desiredHeight
            behavior.state = com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_EXPANDED
        }
    }
    
    private fun loadNotifications() {
        notifications.clear()
        notifications.addAll(NotificationManager.getNotifications())
        adapter.notifyDataSetChanged()
        
        if (notifications.isEmpty()) {
            rvNotifications.visibility = View.GONE
            tvEmpty.visibility = View.VISIBLE
        } else {
            rvNotifications.visibility = View.VISIBLE
            tvEmpty.visibility = View.GONE
        }
    }
}


class NotificationAdapter(
    private val notifications: List<AppNotification>,
    private val onClick: (AppNotification) -> Unit
) : RecyclerView.Adapter<NotificationAdapter.ViewHolder>() {
    
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle: TextView = view.findViewById(R.id.tvTitle)
        val tvMessage: TextView = view.findViewById(R.id.tvMessage)
        val tvTime: TextView = view.findViewById(R.id.tvTime)
        val indicator: View = view.findViewById(R.id.indicator)
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val notif = notifications[position]
        holder.tvTitle.text = when (notif.type) {
            "mention" -> "@${notif.fromUser} mentioned you"
            "reply" -> "${notif.fromUser} replied to you"
            else -> "Notification"
        }
        holder.tvMessage.text = notif.message
        holder.tvTime.text = formatTimeAgo(notif.timestamp)
        holder.indicator.visibility = if (notif.read) View.GONE else View.VISIBLE
        holder.itemView.setOnClickListener { onClick(notif) }
    }
    
    override fun getItemCount() = notifications.size
    
    private fun formatTimeAgo(timestamp: Long): String {
        val diff = System.currentTimeMillis() - timestamp
        return when {
            diff < 60000 -> "Just now"
            diff < 3600000 -> "${diff / 60000}m ago"
            diff < 86400000 -> "${diff / 3600000}h ago"
            else -> "${diff / 86400000}d ago"
        }
    }
}


class MentionAdapter(
    private val users: List<String>,
    private val onClick: (String) -> Unit
) : RecyclerView.Adapter<MentionAdapter.ViewHolder>() {
    
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvUsername: TextView = view.findViewById(R.id.tvUsername)
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_mention, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val username = users[position]
        holder.tvUsername.text = "@$username"
        holder.itemView.setOnClickListener { onClick(username) }
    }
    
    override fun getItemCount() = users.size
}
