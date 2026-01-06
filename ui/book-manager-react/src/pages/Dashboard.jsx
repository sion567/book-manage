import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCategories: 0,
    recentBooks: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 这行代码执行时，程序会“暂停”在这里，直到结果返回
        const [books, categories] = await Promise.all([
          api.get('/books'),
          api.get('/books/categories'),
        ]);
        // 只有拿到结果后，才会执行下面这行
        setStats({
          totalBooks: books.length,
          totalCategories: categories.length,
          recentBooks: books.slice(-5).reverse(),
        });
      } catch (err) {
        console.error('同步失败', err);
      }
    };

    fetchData(); // 初始加载

    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval); // 组件卸载时清理计时器
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>控制台首页</h1>

      {/* 统计卡片区域 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        <div className="stat-card" style={cardStyle('#4361ee')}>
          <h3>总图书量</h3>
          <div style={countStyle}>{stats.totalBooks}</div>
          <Link to="/books" style={linkStyle}>
            查看全部 →
          </Link>
        </div>

        <div className="stat-card" style={cardStyle('#3f37c9')}>
          <h3>分类数量</h3>
          <div style={countStyle}>{stats.totalCategories}</div>
          <p style={{ margin: '10px 0', opacity: 0.8 }}>覆盖多个学科</p>
        </div>

        <div className="stat-card" style={cardStyle('#4cc9f0')}>
          <h3>系统状态</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '10px' }}>运行正常</div>
          <p style={{ margin: '10px 0', opacity: 0.8 }}>数据库已连接</p>
        </div>
      </div>

      {/* 最近入库 */}
      <div
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          最近入库
        </h3>
        <table width="100%" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#666' }}>
              <th style={thStyle}>书名</th>
              <th style={thStyle}>作者</th>
              <th style={thStyle}>发布日期</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBooks.map((book) => (
              <tr key={book.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={tdStyle}>{book.title}</td>
                <td style={tdStyle}>{book.author}</td>
                <td style={tdStyle}>
                  {book.createdDate ? new Date(book.createdDate).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.recentBooks.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px' }}>暂无数据</p>
        )}
      </div>
    </div>
  );
};

const cardStyle = (color) => ({
  background: color,
  color: '#fff',
  padding: '25px',
  borderRadius: '15px',
  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  position: 'relative',
});

const countStyle = {
  fontSize: '3rem',
  fontWeight: '800',
  margin: '10px 0',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '0.9rem',
  borderBottom: '1px solid #fff',
};

const thStyle = { padding: '12px', fontWeight: '600' };
const tdStyle = { padding: '12px', color: '#444' };

export default Dashboard;
