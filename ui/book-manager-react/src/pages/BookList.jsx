import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BookList = () => {
  const [books, setBooks] = useState([]);

  const loadBooks = () => {
    fetch('http://localhost:8080/api/v1/books')
      .then((res) => res.json())
      .then((data) => setBooks(data));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const deleteBook = (id) => {
    if (window.confirm('確定要刪除嗎？')) {
      fetch(`http://localhost:8080/api/v1/books/${id}`, { method: 'DELETE' }).then(() =>
        loadBooks(),
      );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>圖書列表</h2>
        <Link
          to="/add"
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          新增圖書
        </Link>
      </div>
      <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>標題</th>
            <th>作者</th>
            <th>價格</th>
            <th>分類</th>
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
