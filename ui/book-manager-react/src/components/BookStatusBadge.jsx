import React from 'react';

// 去掉 : React.FC<...> 這些 TS 語法，剩下的就是標準 JSX
// const BookStatusBadge: React.FC<BookStatusBadgeProps> = (props) => {
const BookStatusBadge = (props) => {
  const { stockCount } = props;
  return <span className="badge">{stockCount > 0 ? '有' : '无'}</span>;
};

export default BookStatusBadge;

// 自定义单元组件
// 接收 props，渲染后，并将结果返回给父组件。
