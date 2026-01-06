import React, { useEffect, useMemo, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { bookSchema } from '../schemas/bookSchema';
import { api } from '../api/apiClient';

const BookManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);

  //这是 React 的缓存 Hook（Memoization）
  const survey = useMemo(() => new Model(bookSchema), []); // 创建一个 Survey 实例，并让它在组件的整个生命周期内保持不变。
  /*
  不带 useMemo：每当有一个访客进来（组件更新），你都把办公桌拆了重新买一套新的。
带 useMemo：办公室装修（初次渲染）时买了一套办公桌（Survey 实例），以后无论来多少访客，办公桌始终在那儿。
在 React 中集成像 SurveyJS、ECharts 或 Google Maps 这种拥有自己内部状态的重型第三方库时，必须使用 useMemo 或 useRef 来保持实例的唯一性。
*/
  useEffect(() => {
    // useEffect 是处理副作​​用（如 API 调用、手动修改 DOM、订阅事件）的核心工具
    survey.applyTheme({ themeName: 'defaultV2' });

    if (id) {
      api
        .get(`/books/${id}`)
        .then((res) => res.json())
        .then((data) => {
          survey.data = {
            ...data,
            categoryId: data.category?.id,
          };
          setLoading(false);
        })
        .catch((err) => {
          console.error('获取图书详情失败:', err);
          setLoading(false);
        });
    }

    const onCompleteHandler = (sender) => {
      const request = id ? api.put(`/books/${id}`, sender.data) : api.post('/books', sender.data);

      request
        .then(() => {
          alert(id ? '修改成功' : '添加成功');
          navigate('/');
        })
        .catch((err) => {
          console.error('提交失败:', err);
          // 如果报错，但是数据已经成功保存，也可以跳转
          if (err.message.includes('unexpected end')) {
            navigate('/');
          }
        });
    };
    // 綁定 SurveyJS 事件
    survey.onComplete.add(onCompleteHandler);

    // 清理函數：防止多次綁定事件（React 18+ 嚴格模式必備）
    return () => {
      survey.onComplete.remove(onCompleteHandler);
    };
  }, [id, navigate, survey]); // React 会在组件渲染后检查数组里的 id、navigate 和 survey 是否和上一次渲染时完全一致（浅比较）。
  /*
执行时机总结
首次挂载：组件第一次出现在页面上时，代码会执行一次。
如何是空数组 []:代码只在页面初次加载时运行一次
更新时：每当 id、navigate 或 survey 变化时，代码会再次执行。
卸载前（如果写了 return）：如果你的 useEffect 返回了一个函数（Cleanup），它会在组件销毁或下一次副作用执行前运行。
*/

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
