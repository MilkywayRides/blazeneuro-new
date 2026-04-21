package com.blazeneuro

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import kotlinx.coroutines.launch

class OAuthActivity : AppCompatActivity() {
    private lateinit var rvApps: RecyclerView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var tvEmpty: TextView
    private val apps = mutableListOf<OAuthApp>()
    private lateinit var adapter: OAuthAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_oauth)

        findViewById<ImageView>(R.id.ivBack).setOnClickListener { finish() }
        
        rvApps = findViewById(R.id.rvApps)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        tvEmpty = findViewById(R.id.tvEmpty)
        
        adapter = OAuthAdapter(apps)
        rvApps.layoutManager = LinearLayoutManager(this)
        rvApps.adapter = adapter
        
        swipeRefresh.setOnRefreshListener { loadApps() }
        loadApps()
    }

    private fun loadApps() {
        lifecycleScope.launch {
            try {
                val result = AuthApi.getOAuthApps()
                apps.clear()
                apps.addAll(result)
                adapter.notifyDataSetChanged()
                
                if (apps.isEmpty()) {
                    rvApps.visibility = View.GONE
                    tvEmpty.visibility = View.VISIBLE
                } else {
                    rvApps.visibility = View.VISIBLE
                    tvEmpty.visibility = View.GONE
                }
            } catch (e: Exception) {
                android.util.Log.e("OAuthActivity", "Error loading apps", e)
            } finally {
                swipeRefresh.isRefreshing = false
            }
        }
    }
}

data class OAuthApp(
    val id: String,
    val name: String,
    val description: String?,
    val clientId: String,
    val redirectUri: String,
    val createdAt: String
)

class OAuthAdapter(private val apps: List<OAuthApp>) : RecyclerView.Adapter<OAuthAdapter.ViewHolder>() {
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tvAppName)
        val tvDesc: TextView = view.findViewById(R.id.tvAppDesc)
        val tvClientId: TextView = view.findViewById(R.id.tvClientId)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_oauth_app, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val app = apps[position]
        holder.tvName.text = app.name
        holder.tvDesc.text = app.description ?: "No description"
        holder.tvClientId.text = "Client ID: ${app.clientId}"
    }

    override fun getItemCount() = apps.size
}
