import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthGuardV1 = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (!token) {
    // 将用户当前想去的路径存入state,登录成功后可以跳回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuardV1;
