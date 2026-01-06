import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookList from './pages/BookList';
import BookManage from './pages/BookManage';

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
          <Route path="/" element={<BookList />} />
          <Route path="/add" element={<BookManage />} />
          <Route path="/edit/:id" element={<BookManage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
