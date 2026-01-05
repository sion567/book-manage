import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getUserRole(); // 假设服务中有此方法

    if (userRole === requiredRole) {
      return true;
    }

    alert('您没有权限访问此页面');
    return router.parseUrl('/unauthorized');
  };
};
