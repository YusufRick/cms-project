import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // TODO: Implement API call to backend
    // Example: const response = await fetch('http://localhost:5000/api/auth/login', {...})
    
    // Mock login for demonstration
    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: 'consumer',
      organization: 'bank',
      createdAt: new Date(),
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const signup = async (email, password, name, role, organization) => {
    // TODO: Implement API call to backend
    // Example: const response = await fetch('http://localhost:5000/api/auth/register', {...})
    
    const mockUser = {
      id: Date.now().toString(),
      email,
      name,
      role,
      organization,
      createdAt: new Date(),
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
