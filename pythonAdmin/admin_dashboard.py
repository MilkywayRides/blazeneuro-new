import customtkinter as ctk
from tkinter import ttk
import tkinter as tk

class AdminDashboard(ctk.CTkFrame):
    def __init__(self, parent, auth_service):
        super().__init__(parent, fg_color="#09090b")
        self.auth_service = auth_service
        self.pack(fill="both", expand=True)
        self.create_widgets()
    
    def create_widgets(self):
        # Sidebar
        sidebar = ctk.CTkFrame(self, fg_color="#18181b", width=250)
        sidebar.pack(side="left", fill="y", padx=(0, 0))
        sidebar.pack_propagate(False)
        
        # Logo
        logo = ctk.CTkLabel(
            sidebar,
            text="BlazeNeuro",
            font=("Arial", 20, "bold"),
            text_color="#fafafa"
        )
        logo.pack(pady=(30, 40), padx=20)
        
        # Navigation buttons
        self.nav_buttons = []
        nav_items = [
            ("Dashboard", "📊"),
            ("Users", "👥"),
            ("Blogs", "📝"),
            ("OAuth Apps", "🔐"),
            ("Analytics", "📈"),
            ("Settings", "⚙️")
        ]
        
        for text, icon in nav_items:
            btn = ctk.CTkButton(
                sidebar,
                text=f"{icon}  {text}",
                height=45,
                fg_color="transparent",
                text_color="#a1a1aa",
                hover_color="#27272a",
                anchor="w",
                font=("Arial", 14),
                command=lambda t=text: self.switch_view(t)
            )
            btn.pack(padx=15, pady=5, fill="x")
            self.nav_buttons.append(btn)
        
        # Main content area
        self.content_frame = ctk.CTkFrame(self, fg_color="#09090b")
        self.content_frame.pack(side="right", fill="both", expand=True, padx=20, pady=20)
        
        # Show dashboard by default
        self.switch_view("Dashboard")
    
    def switch_view(self, view_name):
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Update nav button colors
        for btn in self.nav_buttons:
            if view_name in btn.cget("text"):
                btn.configure(fg_color="#27272a", text_color="#fafafa")
            else:
                btn.configure(fg_color="transparent", text_color="#a1a1aa")
        
        # Show selected view
        if view_name == "Dashboard":
            self.show_dashboard()
        elif view_name == "Users":
            self.show_users()
        elif view_name == "Blogs":
            self.show_blogs()
        elif view_name == "OAuth Apps":
            self.show_oauth_apps()
        elif view_name == "Analytics":
            self.show_analytics()
        elif view_name == "Settings":
            self.show_settings()
    
    def show_dashboard(self):
        title = ctk.CTkLabel(
            self.content_frame,
            text="Dashboard",
            font=("Arial", 32, "bold"),
            text_color="#fafafa",
            anchor="w"
        )
        title.pack(pady=(0, 30), fill="x")
        
        # Stats cards
        stats_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        stats_frame.pack(fill="x", pady=(0, 30))
        
        stats = [
            ("Total Users", "1,234", "👥"),
            ("Total Blogs", "89", "📝"),
            ("OAuth Apps", "12", "🔐"),
            ("Active Sessions", "456", "🔄")
        ]
        
        for i, (label, value, icon) in enumerate(stats):
            card = ctk.CTkFrame(stats_frame, fg_color="#18181b", corner_radius=12)
            card.grid(row=0, column=i, padx=10, sticky="ew")
            stats_frame.columnconfigure(i, weight=1)
            
            icon_label = ctk.CTkLabel(card, text=icon, font=("Arial", 24))
            icon_label.pack(pady=(20, 5))
            
            value_label = ctk.CTkLabel(
                card,
                text=value,
                font=("Arial", 28, "bold"),
                text_color="#fafafa"
            )
            value_label.pack()
            
            label_text = ctk.CTkLabel(
                card,
                text=label,
                font=("Arial", 14),
                text_color="#a1a1aa"
            )
            label_text.pack(pady=(5, 20))
    
    def show_users(self):
        title = ctk.CTkLabel(
            self.content_frame,
            text="Users Management",
            font=("Arial", 32, "bold"),
            text_color="#fafafa",
            anchor="w"
        )
        title.pack(pady=(0, 20), fill="x")
        
        # Table frame
        table_frame = ctk.CTkFrame(self.content_frame, fg_color="#18181b", corner_radius=12)
        table_frame.pack(fill="both", expand=True)
        
        # Create scrollable frame
        scroll_frame = ctk.CTkScrollableFrame(table_frame, fg_color="#18181b")
        scroll_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Headers
        headers = ["ID", "Name", "Email", "Role", "Created At"]
        for i, header in enumerate(headers):
            label = ctk.CTkLabel(
                scroll_frame,
                text=header,
                font=("Arial", 14, "bold"),
                text_color="#fafafa",
                anchor="w"
            )
            label.grid(row=0, column=i, padx=10, pady=10, sticky="w")
        
        # Fetch and display users
        users = self.auth_service.get_users()
        for idx, user in enumerate(users[:20], start=1):
            ctk.CTkLabel(
                scroll_frame,
                text=user.get("id", "")[:8],
                text_color="#a1a1aa",
                anchor="w"
            ).grid(row=idx, column=0, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(
                scroll_frame,
                text=user.get("name", ""),
                text_color="#fafafa",
                anchor="w"
            ).grid(row=idx, column=1, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(
                scroll_frame,
                text=user.get("email", ""),
                text_color="#a1a1aa",
                anchor="w"
            ).grid(row=idx, column=2, padx=10, pady=5, sticky="w")
            
            role_badge = ctk.CTkLabel(
                scroll_frame,
                text=user.get("role", "user"),
                text_color="#fafafa",
                fg_color="#27272a",
                corner_radius=6,
                padx=10,
                pady=5
            )
            role_badge.grid(row=idx, column=3, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(
                scroll_frame,
                text=user.get("createdAt", "")[:10],
                text_color="#a1a1aa",
                anchor="w"
            ).grid(row=idx, column=4, padx=10, pady=5, sticky="w")
    
    def show_blogs(self):
        title = ctk.CTkLabel(
            self.content_frame,
            text="Blogs Management",
            font=("Arial", 32, "bold"),
            text_color="#fafafa",
            anchor="w"
        )
        title.pack(pady=(0, 20), fill="x")
        
        # Table frame
        table_frame = ctk.CTkFrame(self.content_frame, fg_color="#18181b", corner_radius=12)
        table_frame.pack(fill="both", expand=True)
        
        scroll_frame = ctk.CTkScrollableFrame(table_frame, fg_color="#18181b")
        scroll_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Headers
        headers = ["Title", "Author", "Published", "Created At"]
        for i, header in enumerate(headers):
            label = ctk.CTkLabel(
                scroll_frame,
                text=header,
                font=("Arial", 14, "bold"),
                text_color="#fafafa",
                anchor="w"
            )
            label.grid(row=0, column=i, padx=10, pady=10, sticky="w")
        
        # Fetch and display blogs
        blogs = self.auth_service.get_blogs()
        for idx, blog in enumerate(blogs[:20], start=1):
            ctk.CTkLabel(
                scroll_frame,
                text=blog.get("title", "")[:40],
                text_color="#fafafa",
                anchor="w"
            ).grid(row=idx, column=0, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(
                scroll_frame,
                text=blog.get("authorId", "")[:8],
                text_color="#a1a1aa",
                anchor="w"
            ).grid(row=idx, column=1, padx=10, pady=5, sticky="w")
            
            status = "✅" if blog.get("published") else "❌"
            ctk.CTkLabel(
                scroll_frame,
                text=status,
                text_color="#fafafa",
                anchor="w"
            ).grid(row=idx, column=2, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(
                scroll_frame,
                text=blog.get("createdAt", "")[:10],
                text_color="#a1a1aa",
                anchor="w"
            ).grid(row=idx, column=3, padx=10, pady=5, sticky="w")
    
    def show_oauth_apps(self):
        title = ctk.CTkLabel(
            self.content_frame,
            text="OAuth Applications",
            font=("Arial", 32, "bold"),
            text_color="#fafafa",
            anchor="w"
        )
        title.pack(pady=(0, 20), fill="x")
        
        table_frame = ctk.CTkFrame(self.content_frame, fg_color="#18181b", corner_radius=12)
        table_frame.pack(fill="both", expand=True)
        
        scroll_frame = ctk.CTkScrollableFrame(table_frame, fg_color="#18181b")
        scroll_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        headers = ["Name", "Client ID", "Homepage URL", "Status"]
        for i, header in enumerate(headers):
            label = ctk.CTkLabel(
                scroll_frame,
                text=header,
                font=("Arial", 14, "bold"),
                text_color="#fafafa",
                anchor="w"
            )
            label.grid(row=0, column=i, padx=10, pady=10, sticky="w")
        
        apps = self.auth_service.get_oauth_apps()
        for idx, app in enumerate(apps[:20], start=1):
            ctk.CTkLabel(
                scroll_frame,
                text=app.get("name", ""),
                text_color="#fafafa",
                anchor="w"
            ).grid(row=idx, column=0, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(
                scroll_frame,
                text=app.get("clientId", "")[:20],
                text_color="#a1a1aa",
                anchor="w"
            ).grid(row=idx, column=1, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(
                scroll_frame,
                text=app.get("homepageUrl", ""),
                text_color="#a1a1aa",
                anchor="w"
            ).grid(row=idx, column=2, padx=10, pady=5, sticky="w")
            
            status = "Active" if not app.get("archived") else "Archived"
            ctk.CTkLabel(
                scroll_frame,
                text=status,
                text_color="#22c55e" if not app.get("archived") else "#ef4444",
                anchor="w"
            ).grid(row=idx, column=3, padx=10, pady=5, sticky="w")
    
    def show_analytics(self):
        title = ctk.CTkLabel(
            self.content_frame,
            text="Analytics",
            font=("Arial", 32, "bold"),
            text_color="#fafafa",
            anchor="w"
        )
        title.pack(pady=(0, 20), fill="x")
        
        info = ctk.CTkLabel(
            self.content_frame,
            text="Analytics dashboard coming soon...",
            font=("Arial", 16),
            text_color="#a1a1aa"
        )
        info.pack(pady=50)
    
    def show_settings(self):
        title = ctk.CTkLabel(
            self.content_frame,
            text="Settings",
            font=("Arial", 32, "bold"),
            text_color="#fafafa",
            anchor="w"
        )
        title.pack(pady=(0, 20), fill="x")
        
        card = ctk.CTkFrame(self.content_frame, fg_color="#18181b", corner_radius=12)
        card.pack(fill="x", pady=10)
        
        ctk.CTkLabel(
            card,
            text="API Configuration",
            font=("Arial", 18, "bold"),
            text_color="#fafafa",
            anchor="w"
        ).pack(padx=20, pady=(20, 10), fill="x")
        
        ctk.CTkLabel(
            card,
            text=f"API URL: {self.auth_service.api_url}",
            font=("Arial", 14),
            text_color="#a1a1aa",
            anchor="w"
        ).pack(padx=20, pady=5, fill="x")
        
        ctk.CTkLabel(
            card,
            text=f"Session Active: {'Yes' if self.auth_service.session_token else 'No'}",
            font=("Arial", 14),
            text_color="#a1a1aa",
            anchor="w"
        ).pack(padx=20, pady=(5, 20), fill="x")
