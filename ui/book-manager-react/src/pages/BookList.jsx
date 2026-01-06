import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';

const BookList = () => {
  const [books, setBooks] = useState([]);

  const loadBooks = () => {
    api
      .get('/books')
      .then((data) => setBooks(data));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const deleteBook = (id) => {
    if (window.confirm('确定要删除么？')) {
        api
      .delete(`/books${id}`).then(() =>
        loadBooks(),
      );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>图书列表</h2>
        <Link
          to="/add"
          style={{
            padding: '10px 10px',
            background: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          新增图书
        </Link>
      </div>
      <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>标题</th>
            <th>作者</th>
            <th>价格</th>
            <th>分类</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.price}</td>
              <td>{book.category?.name}</td>
              <td>
                <Link to={`/edit/${book.id}`}>編輯</Link> |
                <button
                  onClick={() => deleteBook(book.id)}
                  style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;
