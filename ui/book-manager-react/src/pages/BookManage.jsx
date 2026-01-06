import React, { useEffect, useMemo, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { bookSchema } from '../schemas/bookSchema';

const BookManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);

  const survey = useMemo(() => new Model(bookSchema), []);

  useEffect(() => {
    survey.applyTheme({ themeName: 'defaultV2' });

    if (id) {
      fetch(`http://localhost:8080/api/v1/books/${id}`)
        .then((res) => res.json())
        .then((data) => {
          survey.data = {
            ...data,
            categoryId: data.category?.id,
          };
          setLoading(false);
        });
    }

    survey.onComplete.add((sender) => {
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `http://localhost:8080/api/v1/books/${id}`
        : 'http://localhost:8080/api/v1/books';

      fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sender.data),
      })
        .then((res) => {
          if (res.status === 204 || res.status === 202) {
            return null;
          }
          if (!res.ok) throw new Error('提交失敗');
          return res.json();
        })
        .then((data) => {
          alert(id ? '修改成功' : '添加成功');
          navigate('/');
        })
        .catch((err) => {
          console.error('處理出錯:', err);
          // 即使報錯，如果數據已成功保存，也可以跳轉
          if (err.message.includes('unexpected end')) {
            navigate('/');
          }
        });
    });
  }, [id, navigate, survey]);

  if (loading) return <div className="p-5">加载图书数据中...</div>;

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
      }}
    >
      <Survey model={survey} />
    </div>
  );
};

export default BookManage;
