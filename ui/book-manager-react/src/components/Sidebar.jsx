import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 辅助函数：判断菜单是否激活
  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>📚</span>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>图书管理系统</h2>
      </div>

      <nav style={navStyle}>
        <Link to="/" style={navItemStyle(isActive('/'))}>
          <span style={iconStyle}>🏠</span> 控制台
        </Link>

        <Link to="/books" style={navItemStyle(isActive('/books'))}>
          <span style={iconStyle}>📖</span> 图书列表
        </Link>

        <div style={dividerStyle}></div>

        <button onClick={handleLogout} style={logoutButtonStyle}>
          <span style={iconStyle}>🚪</span> 退出登录
        </button>
      </nav>

      <div style={footerStyle}>&copy; v2026</div>
    </aside>
  );
};

const sidebarStyle = {
  width: '260px',
  height: '100vh',
  backgroundColor: '#1e1e2d',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
};

const logoStyle = {
  padding: '30px 20px',
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #2b2b40',
};

const navStyle = {
  padding: '20px 10px',
  flex: 1,
};

const navItemStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 15px',
  color: active ? '#fff' : '#a2a3b7',
  textDecoration: 'none',
  borderRadius: '8px',
  marginBottom: '5px',
  backgroundColor: active ? '#4361ee' : 'transparent',
  transition: 'all 0.3s ease',
  fontWeight: active ? '600' : '400',
});

const iconStyle = { marginRight: '12px' };

const dividerStyle = {
  height: '1px',
  backgroundColor: '#2b2b40',
  margin: '20px 10px',
};

const logoutButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '12px 15px',
  color: '#ff4d4f',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '1rem',
  borderRadius: '8px',
  transition: 'background 0.3s',
};

const footerStyle = {
  padding: '20px',
  fontSize: '0.8rem',
  color: '#565674',
  textAlign: 'center',
};

export default Sidebar;
