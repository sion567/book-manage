import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = localStorage.getItem('token');

  // Request不可变，需要使用clone
  let authReq = req;
  if (token && token !== 'undefined' && token !== 'null') {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.error('登录过去，请重新登录。');
        authService.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      
      // 抛异常，让 Component 的 RestControllerAdvice 或 catchError 处理
      return throwError(() => error);
    })
  );
};
