import axios from "axios";

const API_URL = "http://localhost:8000";

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

class AuthService {
  async signIn(data: AuthFormData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/signin`, {
      email: data.email,
      password: data.password,
    });
    return response.data;
  }

  async signUp(data: AuthFormData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/signup`, {
      email: data.email,
      password: data.password,
    });
    return response.data;
  }
}

export const authService = new AuthService();
