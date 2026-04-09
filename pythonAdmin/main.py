import customtkinter as ctk
from login_screen import LoginScreen
from admin_dashboard import AdminDashboard

class AdminApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configure window
        self.title("BlazeNeuro Admin")
        self.geometry("1400x800")
        
        # Set theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Configure colors to match shadcn
        self.configure(fg_color="#09090b")
        
        # Show login screen
        self.show_login()
    
    def show_login(self):
        # Clear window
        for widget in self.winfo_children():
            widget.destroy()
        
        # Show login screen
        LoginScreen(self, self.on_login_success)
    
    def on_login_success(self, auth_service):
        # Clear window
        for widget in self.winfo_children():
            widget.destroy()
        
        # Show dashboard
        AdminDashboard(self, auth_service)

if __name__ == "__main__":
    app = AdminApp()
    app.mainloop()
