import React, { useMemo, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLoginMutation, useLazyGetProfileQuery } from '../store/services/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { loginSchema } from '../schemas/authSchema';

const Login = () => {
  const navigate = useNavigate();
  // 获取执行函数和状态对象
  const [login, { isLoading, error }] = useLoginMutation();
  const [triggerGetProfile] = useLazyGetProfileQuery(); // 获取触发函数
  const survey = useMemo(() => new Model(loginSchema), []);
  const dispatch = useDispatch();
  const location = useLocation(); // 返回一个当前url的地址信息的对象
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const handleLogin = async (sender) => {
      try {
        // 1. 调用登录（unwrap 会解开 Promise 并直接返回 data 或抛出 error）
        const result = await login(sender.data).unwrap();
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
        const userProfile = await triggerGetProfile().unwrap();
        dispatch(setUser(userProfile));
        navigate(from, { replace: true });
      } catch (err) {
        alert('登录失败，请检查邮箱或者密码。');
        console.error('登录失败:', err);
      }
    };
    // 2. 先移除舊的，再添加新的（雙重保險）
    survey.onComplete.clear();
    survey.onComplete.add(handleLogin);

    return () => {
      survey.onComplete.remove(handleLogin);
      survey.onComplete.clear();
    };
  }, [survey, navigate]);
  // 这里为啥不用[]，违反了诚实原则 (Exhaustive Deps)，React官方强烈建议Effect应该声明所有使用的响应式值
  // survey使用useMemo定义，它的引用在组件挂载后就固定了
  // navigate,在组件的整个生命周期内，这个函数的引用是稳定的，不会改变。

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '100px auto',
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {isLoading && <p>正在验证身份...</p>}
      {error && <p style={{ color: 'red' }}>错误: {error.data?.message}</p>}

      <h2 style={{ textAlign: 'center' }}>用户登录</h2>
      <Survey model={survey} />
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        还没有账号？ <Link to="/register">立即注册</Link>
      </div>
    </div>
  );
};

export default Login;
