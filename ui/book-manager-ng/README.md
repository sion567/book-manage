ng new book-manager --routing --style=scss --skip-tests

# 生成核心认证服务
ng g s core/auth/auth

# 生成登录和注册独立组件
ng g c features/auth/login
ng g c features/auth/register

# 生成图书管理组件
ng g c features/books/book-list


npm install --save-dev @types/jasmine