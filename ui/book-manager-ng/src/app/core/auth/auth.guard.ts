import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // 注入认证服务
  const router = inject(Router);           // 注入路由

  // 1. 检查 AuthService 中的登录状态（通常是一个 Signal）
  if (authService.isLoggedIn()) {
    return true; // 已登录，允许访问
  }

  // 2. 未登录，跳转到登录页
  // state.url 可以记录用户当前想去的页面，登录后可跳回
  return router.createUrlTree(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
};