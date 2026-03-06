import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('clp_term_token');
    const storedUser = localStorage.getItem('clp_term_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {
        localStorage.removeItem('clp_term_token');
        localStorage.removeItem('clp_term_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('clp_term_token', token);
    localStorage.setItem('clp_term_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('clp_term_token');
    localStorage.removeItem('clp_term_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
