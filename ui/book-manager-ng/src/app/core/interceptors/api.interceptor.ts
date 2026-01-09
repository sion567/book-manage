import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';

/**
 * 记录是否正在刷新 Token，防止多个并发请求同时触发多次刷新
 */
let isRefreshing = false;
//BehaviorSubject 作为一个“信号灯”，当刷新成功后，它会广播新 Token，让所有被挂起的请求（filter(token => token !== null)）重新启动。
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
  null,
);

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("url", req.url);
  // 1. 如果请求的是刷新接口，直接放行，不要覆盖它的 Header
  if (req.url.includes('/refresh-token')) {
    return next(req);
  }
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. 获取本地 Access Token
  const accessToken = localStorage.getItem('access_token');

  // 2. 如果有 Token 且请求不是发送给第三方（可选判断），则注入 Header
  let authReq = req;
  if (accessToken && accessToken !== 'undefined') {
    authReq = addTokenHeader(req, accessToken);
  } else {
    authReq = req;
  }

  // 3. 执行请求并处理错误
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 如果报错是 401 且不是刷新接口本身报错
      if (error.status === 401 && !req.url.includes('/refresh-token')) {
        return handle401Error(authService, router, req, next);
      }

      // 如果是 403 (权限不足) 或刷新接口也返回 401
      if (error.status === 403 || req.url.includes('/refresh-token')) {
        return logoutAndRedirect(authService, router);
      }

      return throwError(() => error);
    }),
  );
};

/**
 * 处理 401 错误的逻辑：尝试刷新 Token
 */
function handle401Error(
  authService: AuthService,
  router: Router,
  req: HttpRequest<any>,
  next: HttpHandlerFn,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
      return logoutAndRedirect(authService, router);
    }

    // 调用刷新接口
    return authService.refreshToken(refreshToken).pipe(
      switchMap((res: any) => {
        isRefreshing = false;

        // 保存新 Token
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);

        // 通知所有等待中的请求，新 Token 已经好了
        refreshTokenSubject.next(res.access_token);

        // 重试原始请求
        return next(addTokenHeader(req, res.access_token));
      }),
      catchError((err) => {
        isRefreshing = false;
        return logoutAndRedirect(authService, router);
      }),
    );
  } else {
    // 如果已经在刷新中了，让当前请求挂起等待直到新 Token 产生
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addTokenHeader(req, token!))),
    );
  }
}

/**
 * 辅助函数：为请求添加 Authorization Header
 */
function addTokenHeader(request: HttpRequest<any>, token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * 辅助函数：清理并跳转到登录页
 */
function logoutAndRedirect(authService: AuthService, router: Router) {
  authService.logout(); // 该方法内部应执行 localStorage.clear() 并重置 Signal

  // 避免在已经在登录页时重复跳转
  if (!router.url.includes('/login')) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: router.url },
    });
  }

  return throwError(() => new Error('会话过期，请重新登录'));
}
