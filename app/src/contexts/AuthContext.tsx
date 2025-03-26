import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, User, AuthFormData } from "../services/authService";

interface AuthContextType {
  user: User | null;
  signIn: (data: AuthFormData) => Promise<void>;
  signUp: (data: AuthFormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService.setToken(token);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (data: AuthFormData) => {
    const { access_token, user } = await authService.signIn(data);
    authService.setToken(access_token);
    setUser(user);
  };

  const signUp = async (data: AuthFormData) => {
    const { access_token, user } = await authService.signUp(data);
    authService.setToken(access_token);
    setUser(user);
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
