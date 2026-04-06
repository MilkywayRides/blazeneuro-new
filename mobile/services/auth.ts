import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const authService = {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/sign-in/email`, {
      email,
      password,
    });
    return response.data;
  },

  async signup(email: string, password: string, name: string) {
    const response = await axios.post(`${API_URL}/sign-up/email`, {
      email,
      password,
      name,
    });
    return response.data;
  },

  async sendOTP(email: string) {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
  },

  async verifyOTP(email: string, otp: string) {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data;
  },
};
