package com.blazeneuro

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class HomeActivity : AppCompatActivity() {
    private lateinit var container: FrameLayout
    private lateinit var navHome: View
    private lateinit var navSearch: View
    private lateinit var navBlogs: View
    private lateinit var navProjects: View
    private lateinit var navProfile: View

    override fun onCreate(savedInstanceState: Bundle?) {
        applyTheme()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_bottom_nav)
        AuthApi.init(this)
        
        // Set status bar appearance based on theme
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            val nightMode = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
            if (nightMode == android.content.res.Configuration.UI_MODE_NIGHT_NO) {
                // Light mode - dark status bar icons
                window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            }
        }

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

        showFragment(HomeFragment(), 0)
    }

    private fun showFragment(fragment: Fragment, index: Int) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
        updateNavSelection(index)
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

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        view.findViewById<TextView>(R.id.tvTitle).text = "Welcome, ${AuthApi.getSavedUserName()}!"
        swipeRefresh = view.findViewById(R.id.swipeRefresh)
        viewPager = view.findViewById(R.id.vpCarousel)
        
        swipeRefresh.setOnRefreshListener {
            loadTopBlogs()
        }
        
        setupCarousel()
        loadTopBlogs()
    }
    
    private fun setupCarousel() {
        val adapter = CarouselAdapter(topBlogs) { blog ->
            val intent = Intent(requireContext(), BlogDetailActivity::class.java).apply {
                putExtra("slug", blog.slug)
            }
            startActivity(intent)
        }
        viewPager.adapter = adapter
        viewPager.offscreenPageLimit = 1
        
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
                val currentItem = viewPager.currentItem
                val nextItem = if (currentItem == topBlogs.size - 1) 0 else currentItem + 1
                viewPager.setCurrentItem(nextItem, true)
            }
        }
    }
    
    private fun setupDots() {
        val dotsLayout = view?.findViewById<android.widget.LinearLayout>(R.id.dotsIndicator)
        viewPager.registerOnPageChangeCallback(object : androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                updateDots(position)
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
                topBlogs.clear()
                topBlogs.addAll(blogs)
                viewPager.adapter?.notifyDataSetChanged()
                updateDots(0)
                swipeRefresh.isRefreshing = false
            } catch (e: Exception) {
                swipeRefresh.isRefreshing = false
            }
        }
    }
}

class CarouselAdapter(
    private val blogs: List<AuthApi.Blog>,
    private val onClick: (AuthApi.Blog) -> Unit
) : RecyclerView.Adapter<CarouselAdapter.ViewHolder>() {

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
        val blog = blogs[position]
        holder.tvTitle.text = blog.title
        holder.tvLikes.text = "❤️ ${formatCount(blog.likeCount)} likes"
        
        if (!blog.coverImage.isNullOrEmpty()) {
            com.bumptech.glide.Glide.with(holder.ivCover)
                .load(blog.coverImage)
                .centerCrop()
                .into(holder.ivCover)
        }
        
        holder.itemView.setOnClickListener { onClick(blog) }
    }

    override fun getItemCount() = blogs.size
    
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
    private val results = mutableListOf<AuthApi.SearchResult>()
    private lateinit var adapter: SearchAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        etSearch = view.findViewById(R.id.etSearch)
        rvResults = view.findViewById(R.id.rvSearchResults)
        adapter = SearchAdapter(results)
        rvResults.layoutManager = LinearLayoutManager(context)
        rvResults.adapter = adapter

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val query = s.toString()
                if (query.length >= 2) {
                    lifecycleScope.launch {
                        delay(300)
                        searchBlogs(query)
                    }
                }
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
    }

    private suspend fun searchBlogs(query: String) {
        val searchResults = AuthApi.searchBlogs(query)
        results.clear()
        results.addAll(searchResults)
        adapter.notifyDataSetChanged()
    }
}

class SearchAdapter(private val results: List<AuthApi.SearchResult>) : RecyclerView.Adapter<SearchAdapter.ViewHolder>() {
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle: TextView = view.findViewById(R.id.tvFeatureTitle)
        val tvDesc: TextView = view.findViewById(R.id.tvFeatureDesc)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_feature, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val result = results[position]
        holder.tvTitle.text = result.title
        holder.tvDesc.visibility = View.GONE
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
class ProjectsFragment : Fragment(R.layout.fragment_projects)

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
