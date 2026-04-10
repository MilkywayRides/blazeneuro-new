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
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_bottom_nav)
        AuthApi.init(this)

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
}

class HomeFragment : Fragment(R.layout.fragment_home) {
    private lateinit var swipeRefresh: SwipeRefreshLayout

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        view.findViewById<TextView>(R.id.tvTitle).text = "Welcome, ${AuthApi.getSavedUserName()}!"
        swipeRefresh = view.findViewById(R.id.swipeRefresh)
        swipeRefresh.setOnRefreshListener {
            swipeRefresh.isRefreshing = false
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

class BlogAdapter(private val blogs: List<AuthApi.Blog>) : RecyclerView.Adapter<BlogAdapter.ViewHolder>() {
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivCover: ImageView = view.findViewById(R.id.ivCover)
        val tvTitle: TextView = view.findViewById(R.id.tvBlogTitle)
        val tvDesc: TextView = view.findViewById(R.id.tvBlogDesc)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_blog, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val blog = blogs[position]
        holder.tvTitle.text = blog.title
        holder.tvDesc.text = blog.description ?: "${blog.readTime} min read"
        
        // Load cover image with Glide
        if (!blog.coverImage.isNullOrEmpty()) {
            com.bumptech.glide.Glide.with(holder.itemView.context)
                .load(blog.coverImage)
                .placeholder(R.drawable.ic_home)
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

    override fun getItemCount() = blogs.size
}
class ProjectsFragment : Fragment(R.layout.fragment_projects)

class ProfileFragment : Fragment(R.layout.fragment_profile) {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        view.findViewById<TextView>(R.id.tvUserName).text = AuthApi.getSavedUserName()
        view.findViewById<TextView>(R.id.tvUserEmail).text = AuthApi.getSavedUserEmail()
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
}
