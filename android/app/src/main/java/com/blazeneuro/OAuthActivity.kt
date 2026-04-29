package com.blazeneuro

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.launch

class OAuthActivity : AppCompatActivity() {
    private lateinit var rvApps: RecyclerView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var tvEmpty: TextView
    private lateinit var fabCreate: FloatingActionButton
    private val apps = mutableListOf<OAuthApp>()
    private lateinit var adapter: OAuthAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_oauth)

        findViewById<ImageView>(R.id.ivBack).setOnClickListener { finish() }
        
        rvApps = findViewById(R.id.rvApps)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        tvEmpty = findViewById(R.id.tvEmpty)
        fabCreate = findViewById(R.id.fabCreate)
        
        adapter = OAuthAdapter(apps)
        rvApps.layoutManager = LinearLayoutManager(this)
        rvApps.adapter = adapter
        
        swipeRefresh.setOnRefreshListener { loadApps() }
        fabCreate.setOnClickListener { showCreateDialog() }
        
        loadApps()
    }

    private fun showCreateDialog() {
        CreateOAuthBottomSheet { loadApps() }.show(supportFragmentManager, "create_oauth")
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
        
        holder.itemView.setOnClickListener {
            val intent = Intent(holder.itemView.context, OAuthAppDetailActivity::class.java).apply {
                putExtra("appId", app.id)
                putExtra("appName", app.name)
                putExtra("appDesc", app.description)
                putExtra("clientId", app.clientId)
                putExtra("redirectUri", app.redirectUri)
            }
            holder.itemView.context.startActivity(intent)
        }
    }

    override fun getItemCount() = apps.size
}

class CreateOAuthBottomSheet(private val onCreated: () -> Unit) : com.google.android.material.bottomsheet.BottomSheetDialogFragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.bottom_sheet_create_oauth, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        val etName = view.findViewById<EditText>(R.id.etAppName)
        val etDesc = view.findViewById<EditText>(R.id.etAppDesc)
        val etHomepage = view.findViewById<EditText>(R.id.etHomepage)
        val etCallback = view.findViewById<EditText>(R.id.etCallback)
        val btnCreate = view.findViewById<View>(R.id.btnCreate)
        
        btnCreate.setOnClickListener {
            val name = etName.text.toString().trim()
            val desc = etDesc.text.toString().trim()
            val homepage = etHomepage.text.toString().trim()
            val callback = etCallback.text.toString().trim()
            
            if (name.isEmpty() || homepage.isEmpty() || callback.isEmpty()) {
                android.widget.Toast.makeText(context, "Fill all required fields", android.widget.Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            lifecycleScope.launch {
                try {
                    val success = AuthApi.createOAuthApp(name, desc, homepage, callback)
                    if (success) {
                        android.widget.Toast.makeText(context, "App created", android.widget.Toast.LENGTH_SHORT).show()
                        dismiss()
                        onCreated()
                    } else {
                        android.widget.Toast.makeText(context, "Failed to create app", android.widget.Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    android.widget.Toast.makeText(context, "Error: ${e.message}", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
