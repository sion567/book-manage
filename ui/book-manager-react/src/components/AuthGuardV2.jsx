import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const AuthGuardV2 = () => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (!token) {
    // 將用戶當前想去的路徑存入 state，登錄成功後可以跳回來
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main
        style={{ flex: 1, marginLeft: '260px', backgroundColor: '#f4f7fe', minHeight: '100vh' }}
      >
        <Outlet /> {/* 子頁面（如 BookList）會顯示在這裡 */}
      </main>
    </div>
  );
};

export default AuthGuardV2;
