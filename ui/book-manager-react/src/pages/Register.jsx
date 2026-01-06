import React, { useMemo, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema } from '../schemas/authSchema';
import { api } from '../api/apiClient';
const Register = () => {
  const navigate = useNavigate();
  const survey = useMemo(() => new Model(registerSchema), []);

  useEffect(() => {
    const onCompleteHandler = (sender) => {
      const { confirmPassword, ...registerData } = sender.data; //提取 confirmPassword，其余存入 registerData
      api
        .post('/auth/register', registerData)
        .then((res) => {
          if (res.ok) {
            alert('注册成功，请登录');
            navigate('/login');
          }
        })
        .catch((err) => {
          alert(err.message || '注册失败');
        });
    };

    survey.onComplete.add(onCompleteHandler);

    return () => {
      survey.onComplete.remove(onCompleteHandler);
    };
  }, [survey, navigate]);

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '60px auto',
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>新用户注册</h2>
      <Survey model={survey} />
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        已有账号？ <Link to="/login">返回登录</Link>
      </div>
    </div>
  );
};

export default Register;
