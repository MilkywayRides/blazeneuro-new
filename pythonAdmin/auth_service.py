import customtkinter as ctk
import requests
import os
from dotenv import load_dotenv

load_dotenv()

class AuthService:
    def __init__(self):
        self.api_url = os.getenv("API_URL", "http://localhost:3000")
        self.session_token = None
        self.cookies = None
        
    def login(self, email, password):
        try:
            response = requests.post(
                f"{self.api_url}/api/auth/sign-in/email",
                json={"email": email, "password": password},
                headers={
                    "Content-Type": "application/json",
                    "Origin": self.api_url
                }
            )
            if response.status_code == 200:
                self.cookies = response.cookies
                data = response.json()
                self.session_token = data.get("token")
                return True, data
            return False, "Invalid credentials"
        except Exception as e:
            return False, str(e)
    
    def get_headers(self):
        headers = {
            "Content-Type": "application/json",
            "Origin": self.api_url
        }
        if self.session_token:
            headers["Authorization"] = f"Bearer {self.session_token}"
        return headers
    
    def make_request(self, method, endpoint):
        try:
            response = requests.request(
                method,
                f"{self.api_url}{endpoint}",
                headers=self.get_headers(),
                cookies=self.cookies
            )
            return response.json() if response.status_code == 200 else {"error": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    def get_users(self):
        result = self.make_request("GET", "/api/admin/users")
        return result.get("users", [])
    
    def get_blogs(self):
        result = self.make_request("GET", "/api/admin/blogs")
        return result.get("blogs", [])
    
    def get_oauth_apps(self):
        result = self.make_request("GET", "/api/admin/oauth/apps")
        return result.get("apps", [])
    
    def update_user_role(self, user_id, role):
        try:
            response = requests.patch(
                f"{self.api_url}/api/admin/users/{user_id}",
                json={"role": role},
                headers=self.get_headers(),
                cookies=self.cookies
            )
            return response.status_code == 200
        except:
            return False
