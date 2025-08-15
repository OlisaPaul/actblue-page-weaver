import { loginUser } from '../services/authService';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('webiny-token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name || decoded.email
        });
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('webiny-token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
  try {
    const data = await loginUser(email, password);
    const token = data.token;

    localStorage.setItem('webiny-token', token);

    const decoded = jwtDecode<JwtPayload>(token);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email,
    });
  } catch (error) {
    console.error('Login failed:', error);
    localStorage.removeItem('webiny-token');
    throw error;
  }
};

  const logout = () => {
    localStorage.removeItem('webiny-token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
