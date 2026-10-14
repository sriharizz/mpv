import React, { createContext, useContext, useState } from 'react';

export interface UserSession {
  username: string;
  enterprise: string;
  loginTimestamp: string;
  environment: 'Validation' | 'Production';
}

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  login: (username: string, enterprise: string, env?: 'Validation' | 'Production') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('onepv_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default logged in user if previously active
    return null;
  });

  const login = (username: string, enterprise: string, env: 'Validation' | 'Production' = 'Validation') => {
    const now = new Date();
    // Format: 14-Oct-2026 14:00:00
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${pad(now.getDate())}-${months[now.getMonth()]}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newSession: UserSession = {
      username: username.trim(),
      enterprise: enterprise.trim(),
      loginTimestamp: timestamp,
      environment: env
    };
    setSession(newSession);
    localStorage.setItem('onepv_user_session', JSON.stringify(newSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('onepv_user_session');
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, login, logout }}>
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
