import customtkinter as ctk
from auth_service import AuthService

class LoginScreen(ctk.CTkFrame):
    def __init__(self, parent, on_login_success):
        super().__init__(parent, fg_color="#09090b")
        self.on_login_success = on_login_success
        self.auth_service = AuthService()
        
        self.pack(fill="both", expand=True)
        self.create_widgets()
    
    def create_widgets(self):
        # Center container
        container = ctk.CTkFrame(self, fg_color="#09090b")
        container.place(relx=0.5, rely=0.5, anchor="center")
        
        # Logo/Title
        title = ctk.CTkLabel(
            container,
            text="BlazeNeuro Admin",
            font=("Arial", 32, "bold"),
            text_color="#fafafa"
        )
        title.pack(pady=(0, 40))
        
        # Card
        card = ctk.CTkFrame(container, fg_color="#18181b", corner_radius=12, width=400)
        card.pack(padx=20, pady=20)
        
        # Card Header
        card_title = ctk.CTkLabel(
            card,
            text="Welcome back",
            font=("Arial", 24, "bold"),
            text_color="#fafafa"
        )
        card_title.pack(pady=(30, 5))
        
        card_desc = ctk.CTkLabel(
            card,
            text="Enter your credentials to access admin panel",
            font=("Arial", 14),
            text_color="#a1a1aa"
        )
        card_desc.pack(pady=(0, 30))
        
        # Email field
        email_label = ctk.CTkLabel(
            card,
            text="Email",
            font=("Arial", 14),
            text_color="#fafafa",
            anchor="w"
        )
        email_label.pack(padx=30, pady=(0, 5), fill="x")
        
        self.email_entry = ctk.CTkEntry(
            card,
            placeholder_text="admin@blazeneuro.com",
            height=40,
            fg_color="#27272a",
            border_color="#3f3f46",
            text_color="#fafafa",
            placeholder_text_color="#71717a"
        )
        self.email_entry.pack(padx=30, pady=(0, 20), fill="x")
        
        # Password field
        password_label = ctk.CTkLabel(
            card,
            text="Password",
            font=("Arial", 14),
            text_color="#fafafa",
            anchor="w"
        )
        password_label.pack(padx=30, pady=(0, 5), fill="x")
        
        self.password_entry = ctk.CTkEntry(
            card,
            placeholder_text="••••••••",
            show="•",
            height=40,
            fg_color="#27272a",
            border_color="#3f3f46",
            text_color="#fafafa",
            placeholder_text_color="#71717a"
        )
        self.password_entry.pack(padx=30, pady=(0, 5), fill="x")
        self.password_entry.bind("<Return>", lambda e: self.login())
        
        # Error label
        self.error_label = ctk.CTkLabel(
            card,
            text="",
            font=("Arial", 12),
            text_color="#ef4444"
        )
        self.error_label.pack(pady=(5, 0))
        
        # Login button
        login_btn = ctk.CTkButton(
            card,
            text="Login",
            height=40,
            fg_color="#fafafa",
            text_color="#09090b",
            hover_color="#e4e4e7",
            font=("Arial", 14, "bold"),
            command=self.login
        )
        login_btn.pack(padx=30, pady=(20, 30), fill="x")
    
    def login(self):
        email = self.email_entry.get()
        password = self.password_entry.get()
        
        if not email or not password:
            self.error_label.configure(text="Please fill in all fields")
            return
        
        success, result = self.auth_service.login(email, password)
        
        if success:
            self.on_login_success(self.auth_service)
        else:
            self.error_label.configure(text=f"Login failed: {result}")
