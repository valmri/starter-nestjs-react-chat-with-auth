import axios from "axios";

const API_URL = "http://localhost:8000/api";

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
}

class AuthService {
  async signIn(data: AuthFormData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/signin`, {
      email: data.email,
      password: data.password,
    });
    console.log(response.data);
    return response.data;
  }

  async signUp(data: AuthFormData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/signup`, {
      email: data.email,
      password: data.password,
    });
    return response.data;
  }

  setToken(token: string) {
    localStorage.setItem("access_token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  removeToken() {
    localStorage.removeItem("access_token");
    delete axios.defaults.headers.common["Authorization"];
  }

  getToken(): string | null {
    return localStorage.getItem("access_token");
  }
}

export const authService = new AuthService();
