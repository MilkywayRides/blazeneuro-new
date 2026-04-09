import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QStackedWidget
from PyQt6.QtCore import Qt
from login_screen import LoginScreen
from admin_dashboard import AdminDashboard

class AdminApp(QMainWindow):
    def __init__(self):
        super().__init__()
        
        self.setWindowTitle("BlazeNeuro Admin")
        self.setGeometry(100, 100, 1400, 800)
        
        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)
        
        self.show_login()
    
    def show_login(self):
        login_screen = LoginScreen()
        login_screen.login_success.connect(self.on_login_success)
        self.stacked_widget.addWidget(login_screen)
        self.stacked_widget.setCurrentWidget(login_screen)
    
    def on_login_success(self, auth_service):
        dashboard = AdminDashboard(auth_service)
        self.stacked_widget.addWidget(dashboard)
        self.stacked_widget.setCurrentWidget(dashboard)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    window = AdminApp()
    window.show()
    
    sys.exit(app.exec())
