import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. 创建 Context 对象
const AuthContext = createContext(null);

// 2. 创建 Provider 组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  // 模拟从 Token 恢复用户信息
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      // 实际开发中这里会调用 api.get('/auth/me')
      // 这里先简单模拟
      setUser({ firstname: "Admin", email: "admin@example.com" });
    }
  }, [user]);

  const login = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. 自定义 Hook 方便其他组件调用
export const useAuth = () => useContext(AuthContext);


// 使用:
// root.render(
//   <AuthProvider>
//     <App />
//   </AuthProvider>
// );
// const { user, logout } = useAuth();