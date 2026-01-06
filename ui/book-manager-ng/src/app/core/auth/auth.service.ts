import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '@shared/models/user.model';
import { AuthResponse } from '@shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = '/api/v1/auth';
  private readonly USER_URL = '/api/v1/users';

  // 使用 signal 存储当前用户信息
  private currentUserSignal = signal<User | null>(null);
  // 暴露一个只读的信号给外部使用
  currentUser = this.currentUserSignal.asReadonly();
  // 暴露只读计算属性，判断是否已登录
  isLoggedIn = computed(() => !!this.currentUser());

  /**
   * 登录方法
   * @param credentials 包含 username 和 password
   */
  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.API_URL}/authenticate`, credentials).pipe(
      tap((response) => {
        console.log('后端原始响应:', response); // 调试用
        if (response) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        } else {
          console.error('错误：响应体中没有找到 token 字段！');
        }
      }),
      switchMap((response) => {
        // 只有拿到 token 才去获取 Profile
        return response.access_token ? this.fetchUserProfile() : of(null);
      }),
      catchError((error) => {
        console.error('登录失败:', error);
        return of(null); // 返回空观察值处理错误
      }),
    );
  }

  fetchUserProfile() {
    return this.http.get<User>(`${this.USER_URL}/profile`).pipe(
      tap((user) => {
        // 2. 更新 Signal 状态
        this.currentUserSignal.set(user);
      }),
    );
  }

  refreshToken(token: string) {
    // 注意：刷新接口通常需要发送 refresh_token
    // 建议直接在 body 或 header 中传递
    return this.http.post<any>(`${this.API_URL}/refresh-token`, {
      refresh_token: token,
    });
  }

  /**
   * 退出登录
   */
  logout() {
    localStorage.removeItem('token');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * 注册方法
   */
  register(userData: any) {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  getUserRole() {
    return null;
  }
}
