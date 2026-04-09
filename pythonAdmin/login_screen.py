from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QFrame
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont
from auth_service import AuthService

class LoginScreen(QWidget):
    login_success = pyqtSignal(object)
    
    def __init__(self):
        super().__init__()
        self.auth_service = AuthService()
        self.setup_ui()
    
    def setup_ui(self):
        self.setStyleSheet("background-color: #09090b;")
        
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # Title
        title = QLabel("BlazeNeuro Admin")
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setStyleSheet("color: #fafafa;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)
        layout.addSpacing(40)
        
        # Card
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background-color: #18181b;
                border-radius: 12px;
            }
        """)
        card.setFixedWidth(400)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(30, 30, 30, 30)
        
        # Card title
        card_title = QLabel("Welcome back")
        card_title.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        card_title.setStyleSheet("color: #fafafa;")
        card_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_layout.addWidget(card_title)
        
        card_desc = QLabel("Enter your credentials to access admin panel")
        card_desc.setFont(QFont("Arial", 14))
        card_desc.setStyleSheet("color: #a1a1aa;")
        card_desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_layout.addWidget(card_desc)
        card_layout.addSpacing(30)
        
        # Email
        email_label = QLabel("Email")
        email_label.setFont(QFont("Arial", 14))
        email_label.setStyleSheet("color: #fafafa;")
        card_layout.addWidget(email_label)
        
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("admin@blazeneuro.com")
        self.email_input.setStyleSheet("""
            QLineEdit {
                background-color: #27272a;
                border: 1px solid #3f3f46;
                border-radius: 6px;
                padding: 10px;
                color: #fafafa;
                font-size: 14px;
            }
            QLineEdit::placeholder {
                color: #71717a;
            }
        """)
        self.email_input.setFixedHeight(40)
        card_layout.addWidget(self.email_input)
        card_layout.addSpacing(20)
        
        # Password
        password_label = QLabel("Password")
        password_label.setFont(QFont("Arial", 14))
        password_label.setStyleSheet("color: #fafafa;")
        card_layout.addWidget(password_label)
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("••••••••")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_input.setStyleSheet("""
            QLineEdit {
                background-color: #27272a;
                border: 1px solid #3f3f46;
                border-radius: 6px;
                padding: 10px;
                color: #fafafa;
                font-size: 14px;
            }
            QLineEdit::placeholder {
                color: #71717a;
            }
        """)
        self.password_input.setFixedHeight(40)
        self.password_input.returnPressed.connect(self.login)
        card_layout.addWidget(self.password_input)
        
        # Error label
        self.error_label = QLabel("")
        self.error_label.setFont(QFont("Arial", 12))
        self.error_label.setStyleSheet("color: #ef4444;")
        self.error_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_layout.addWidget(self.error_label)
        card_layout.addSpacing(20)
        
        # Login button
        login_btn = QPushButton("Login")
        login_btn.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        login_btn.setStyleSheet("""
            QPushButton {
                background-color: #fafafa;
                color: #09090b;
                border: none;
                border-radius: 6px;
                padding: 10px;
            }
            QPushButton:hover {
                background-color: #e4e4e7;
            }
        """)
        login_btn.setFixedHeight(40)
        login_btn.clicked.connect(self.login)
        card_layout.addWidget(login_btn)
        
        layout.addWidget(card)
        self.setLayout(layout)
    
    def login(self):
        email = self.email_input.text()
        password = self.password_input.text()
        
        if not email or not password:
            self.error_label.setText("Please fill in all fields")
            return
        
        success, result = self.auth_service.login(email, password)
        
        if success:
            self.login_success.emit(self.auth_service)
        else:
            self.error_label.setText(f"Login failed: {result}")
