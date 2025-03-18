import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL with explicit protocol
axios.defaults.baseURL = 'http://localhost:5000';

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log('Request:', config);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

// Mock user for development
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User'
};

export const AuthProvider = ({ children }) => {
  // Initialize with mock user
  const [user, setUser] = useState(MOCK_USER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Automatically set mock token
  useEffect(() => {
    localStorage.setItem('token', 'mock-token');
  }, []);

  // Mock auth functions
  const login = async () => {
    setUser(MOCK_USER);
    return MOCK_USER;
  };

  const register = async () => {
    setUser(MOCK_USER);
    return MOCK_USER;
  };

  const logout = () => {
    // Keep the mock user
    console.log('Logout called (disabled in development)');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 