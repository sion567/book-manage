import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard'; // 使用之前配置的路径别名

export const routes: Routes = [
  // 1. 公共路由：登录与注册
  {
    path: 'login',
    title: '用户登录 - 图书管理系统',
    loadComponent: () =>
      import('@features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    title: '注冊新用户',
    loadComponent: () =>
      import('@features/auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // 2. 受保护路由：需要登录才能访问
  {
    path: '',
    canActivate: [authGuard], // 所有的子路由都会受到守卫保护
    children: [
      {
        path: 'dashboard',
        title: '控制台',
        loadComponent: () => import('@features/dashboard/dashboard.component'), // 如果是 default export 可简写
      },
      {
        path: 'books',
        title: '图书列表',
        loadComponent: () => import('@features/books/book-list/book-list').then((m) => m.BookList),
      },
      {
        path: 'books/add',
        title: '新增图书',
        loadComponent: () => import('@features/books/book-edit/book-edit').then((m) => m.BookEdit),
      },
      {
        path: 'books/edit/:id',
        title: '修改图书',
        loadComponent: () => import('@features/books/book-edit/book-edit').then((m) => m.BookEdit),
      },
      {
        path: 'books/:id',
        title: '图书详情',
        loadComponent: () =>
          import('@features/books/book-detail/book-detail').then((m) => m.BookDetail),
      },
      // 默认重定向到控制台
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 3. 通配符路由：处理 404
  {
    path: '**',
    loadComponent: () =>
      import('@shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

//Standalone 模式：通过 loadComponent 异步加载，这意味着用户只有在走错路（触发 404）时，才会下载这个组件的资源。
