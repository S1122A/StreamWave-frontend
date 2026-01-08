import axiosInstance from './axios';
import {ENDPOINTS} from './api';

class AuthService {
  async register(name, email, password, role = 'consumer') {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
        role
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async login(email, password) {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      // Ensure response has the expected structure
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        return response.data.user;
      } else {
        throw new Error('Invalid login response structure');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      } else {
        throw { message: error.message || 'Login failed' };
      }
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
