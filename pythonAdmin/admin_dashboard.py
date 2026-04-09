from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                             QPushButton, QFrame, QScrollArea, QGridLayout)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont

class AdminDashboard(QWidget):
    def __init__(self, auth_service):
        super().__init__()
        self.auth_service = auth_service
        self.setup_ui()
    
    def setup_ui(self):
        self.setStyleSheet("background-color: #09090b;")
        
        main_layout = QHBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # Sidebar
        sidebar = self.create_sidebar()
        main_layout.addWidget(sidebar)
        
        # Content area
        self.content_area = QWidget()
        self.content_area.setStyleSheet("background-color: #09090b;")
        self.content_layout = QVBoxLayout(self.content_area)
        self.content_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.addWidget(self.content_area, 1)
        
        self.setLayout(main_layout)
        self.show_dashboard()
    
    def create_sidebar(self):
        sidebar = QFrame()
        sidebar.setStyleSheet("background-color: #18181b;")
        sidebar.setFixedWidth(250)
        
        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(15, 30, 15, 30)
        
        # Logo
        logo = QLabel("BlazeNeuro")
        logo.setFont(QFont("Arial", 20, QFont.Weight.Bold))
        logo.setStyleSheet("color: #fafafa;")
        logo.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(logo)
        layout.addSpacing(40)
        
        # Navigation buttons
        self.nav_buttons = []
        nav_items = [
            ("📊  Dashboard", self.show_dashboard),
            ("👥  Users", self.show_users),
            ("📝  Blogs", self.show_blogs),
            ("🔐  OAuth Apps", self.show_oauth_apps),
            ("📈  Analytics", self.show_analytics),
            ("⚙️  Settings", self.show_settings)
        ]
        
        for text, callback in nav_items:
            btn = QPushButton(text)
            btn.setFont(QFont("Arial", 14))
            btn.setStyleSheet("""
                QPushButton {
                    background-color: transparent;
                    color: #a1a1aa;
                    border: none;
                    text-align: left;
                    padding: 12px;
                    border-radius: 6px;
                }
                QPushButton:hover {
                    background-color: #27272a;
                }
            """)
            btn.clicked.connect(lambda checked, cb=callback: self.switch_view(cb))
            layout.addWidget(btn)
            self.nav_buttons.append(btn)
        
        layout.addStretch()
        return sidebar
    
    def switch_view(self, callback):
        # Clear content
        while self.content_layout.count():
            child = self.content_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
        
        callback()
    
    def show_dashboard(self):
        title = QLabel("Dashboard")
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setStyleSheet("color: #fafafa;")
        self.content_layout.addWidget(title)
        self.content_layout.addSpacing(30)
        
        # Stats cards
        stats_widget = QWidget()
        stats_layout = QGridLayout(stats_widget)
        stats_layout.setSpacing(10)
        
        stats = [
            ("Total Users", "1,234", "👥"),
            ("Total Blogs", "89", "📝"),
            ("OAuth Apps", "12", "🔐"),
            ("Active Sessions", "456", "🔄")
        ]
        
        for i, (label, value, icon) in enumerate(stats):
            card = self.create_stat_card(icon, value, label)
            stats_layout.addWidget(card, 0, i)
        
        self.content_layout.addWidget(stats_widget)
        self.content_layout.addStretch()
    
    def create_stat_card(self, icon, value, label):
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background-color: #18181b;
                border-radius: 12px;
            }
        """)
        layout = QVBoxLayout(card)
        layout.setContentsMargins(20, 20, 20, 20)
        
        icon_label = QLabel(icon)
        icon_label.setFont(QFont("Arial", 24))
        icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(icon_label)
        
        value_label = QLabel(value)
        value_label.setFont(QFont("Arial", 28, QFont.Weight.Bold))
        value_label.setStyleSheet("color: #fafafa;")
        value_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(value_label)
        
        label_text = QLabel(label)
        label_text.setFont(QFont("Arial", 14))
        label_text.setStyleSheet("color: #a1a1aa;")
        label_text.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(label_text)
        
        return card
    
    def show_users(self):
        title = QLabel("Users Management")
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setStyleSheet("color: #fafafa;")
        self.content_layout.addWidget(title)
        self.content_layout.addSpacing(20)
        
        table = self.create_table(["ID", "Name", "Email", "Role", "Created At"])
        users = self.auth_service.get_users()
        
        for idx, user in enumerate(users[:20]):
            self.add_table_row(table, idx + 1, [
                user.get("id", "")[:8],
                user.get("name", ""),
                user.get("email", ""),
                user.get("role", "user"),
                user.get("createdAt", "")[:10]
            ])
        
        self.content_layout.addWidget(table)
    
    def show_blogs(self):
        title = QLabel("Blogs Management")
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setStyleSheet("color: #fafafa;")
        self.content_layout.addWidget(title)
        self.content_layout.addSpacing(20)
        
        table = self.create_table(["Title", "Author", "Published", "Created At"])
        blogs = self.auth_service.get_blogs()
        
        for idx, blog in enumerate(blogs[:20]):
            status = "✅" if blog.get("published") else "❌"
            self.add_table_row(table, idx + 1, [
                blog.get("title", "")[:40],
                blog.get("authorId", "")[:8],
                status,
                blog.get("createdAt", "")[:10]
            ])
        
        self.content_layout.addWidget(table)
    
    def show_oauth_apps(self):
        title = QLabel("OAuth Applications")
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setStyleSheet("color: #fafafa;")
        self.content_layout.addWidget(title)
        self.content_layout.addSpacing(20)
        
        table = self.create_table(["Name", "Client ID", "Homepage URL", "Status"])
        apps = self.auth_service.get_oauth_apps()
        
        for idx, app in enumerate(apps[:20]):
            status = "Active" if not app.get("archived") else "Archived"
            self.add_table_row(table, idx + 1, [
                app.get("name", ""),
                app.get("clientId", "")[:20],
                app.get("homepageUrl", ""),
                status
            ])
        
        self.content_layout.addWidget(table)
    
    def show_analytics(self):
        title = QLabel("Analytics")
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setStyleSheet("color: #fafafa;")
        self.content_layout.addWidget(title)
        
        info = QLabel("Analytics dashboard coming soon...")
        info.setFont(QFont("Arial", 16))
        info.setStyleSheet("color: #a1a1aa;")
        self.content_layout.addWidget(info)
        self.content_layout.addStretch()
    
    def show_settings(self):
        title = QLabel("Settings")
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setStyleSheet("color: #fafafa;")
        self.content_layout.addWidget(title)
        self.content_layout.addSpacing(20)
        
        card = QFrame()
        card.setStyleSheet("background-color: #18181b; border-radius: 12px;")
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(20, 20, 20, 20)
        
        card_title = QLabel("API Configuration")
        card_title.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        card_title.setStyleSheet("color: #fafafa;")
        card_layout.addWidget(card_title)
        
        api_url = QLabel(f"API URL: {self.auth_service.api_url}")
        api_url.setFont(QFont("Arial", 14))
        api_url.setStyleSheet("color: #a1a1aa;")
        card_layout.addWidget(api_url)
        
        session = QLabel(f"Session Active: {'Yes' if self.auth_service.session_token else 'No'}")
        session.setFont(QFont("Arial", 14))
        session.setStyleSheet("color: #a1a1aa;")
        card_layout.addWidget(session)
        
        self.content_layout.addWidget(card)
        self.content_layout.addStretch()
    
    def create_table(self, headers):
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("background-color: #18181b; border: none; border-radius: 12px;")
        
        table_widget = QWidget()
        self.table_layout = QGridLayout(table_widget)
        self.table_layout.setSpacing(10)
        
        for i, header in enumerate(headers):
            label = QLabel(header)
            label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
            label.setStyleSheet("color: #fafafa;")
            self.table_layout.addWidget(label, 0, i)
        
        scroll.setWidget(table_widget)
        return scroll
    
    def add_table_row(self, scroll, row, data):
        for col, text in enumerate(data):
            label = QLabel(str(text))
            label.setFont(QFont("Arial", 12))
            label.setStyleSheet("color: #a1a1aa;")
            self.table_layout.addWidget(label, row, col)
