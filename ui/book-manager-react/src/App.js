import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookList from './pages/BookList';
import BookManage from './pages/BookManage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AuthGuardV1 from './components/AuthGuardV1';
import AuthGuardV2 from './components/AuthGuardV2';

function App() {
  return (
    <Router>
      <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <nav
          style={{
            padding: '15px 20px',
            background: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <strong style={{ fontSize: '1.2rem' }}>图书管理系統</strong>
        </nav>
        <Routes>
          {/* 公開路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* 受保護路由：必須登錄 */}
          <Route
            path="/"
            element={
              <AuthGuardV1>
                {' '}
                <Dashboard />
              </AuthGuardV1>
            }
          />
          <Route element={<AuthGuardV2 />}>
            <Route path="/books" element={<BookList />} />
            <Route path="/books/add" element={<BookManage />} />
            <Route path="/books/edit/:id" element={<BookManage />} />
          </Route>
          <Route path="*" element={<div>頁面不存在</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
