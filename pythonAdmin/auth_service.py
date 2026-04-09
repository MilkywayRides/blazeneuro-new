import customtkinter as ctk
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class AuthService:
    def __init__(self):
        self.api_url = os.getenv("API_URL", "http://localhost:3000")
        self.session_token = None
        
    def login(self, email, password):
        try:
            response = requests.post(
                f"{self.api_url}/api/auth/sign-in/email",
                json={"email": email, "password": password}
            )
            if response.status_code == 200:
                data = response.json()
                self.session_token = data.get("token")
                return True, data
            return False, "Invalid credentials"
        except Exception as e:
            return False, str(e)
    
    def get_headers(self):
        return {"Authorization": f"Bearer {self.session_token}"} if self.session_token else {}
    
    def get_users(self):
        try:
            response = requests.get(
                f"{self.api_url}/api/admin/users",
                headers=self.get_headers()
            )
            return response.json() if response.status_code == 200 else []
        except:
            return []
    
    def get_blogs(self):
        try:
            response = requests.get(
                f"{self.api_url}/api/admin/blogs",
                headers=self.get_headers()
            )
            return response.json() if response.status_code == 200 else []
        except:
            return []
    
    def get_oauth_apps(self):
        try:
            response = requests.get(
                f"{self.api_url}/api/admin/oauth/apps",
                headers=self.get_headers()
            )
            return response.json() if response.status_code == 200 else []
        except:
            return []
    
    def update_user_role(self, user_id, role):
        try:
            response = requests.patch(
                f"{self.api_url}/api/admin/users/{user_id}",
                json={"role": role},
                headers=self.get_headers()
            )
            return response.status_code == 200
        except:
            return False
