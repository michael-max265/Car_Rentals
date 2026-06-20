import React, { createContext, useEffect, useState } from 'react';
import * as auth from '../auth';

// Create a context for auth state
export const AuthContext = createContext({
  isAuthenticated: false,
  login: async (email, password) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth.getToken());

  const login = async (email, password) => {
    try {
      const token = await auth.login(email, password);
      if (token) {
        setIsAuthenticated(true);
      }
      return token;
    } catch (err) {
      console.error('AuthProvider login error', err);
      throw err;
    }
  };

  const logout = () => {
    auth.logout();
    setIsAuthenticated(false);
  };

  // Keep auth state in sync with token changes (e.g., on load)
  useEffect(() => {
    const token = auth.getToken();
    setIsAuthenticated(!!token);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
