import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpContext, HttpContextToken  } from '@angular/common/http';
import { tap, switchMap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '@shared/models/user.model';
import { AuthResponse } from '@shared/models/auth.model';
import { API_ENDPOINTS } from '@core/constants/api.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

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
    return this.http.post<AuthResponse>(`${API_ENDPOINTS.AUTH.BASE}/authenticate`, credentials).pipe(
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
    return this.http.get<User>(`${API_ENDPOINTS.USERS.PROFILE}`).pipe(
      tap((user) => {
        // 2. 更新 Signal 状态
        this.currentUserSignal.set(user);
      }),
    );
  }

  refreshToken(token: string) {
    // const IS_REFRESH_TOKEN = new HttpContextToken<boolean>(() => false);
    // return this.http.post<any>(`${this.API_URL}/refresh-token`, {}, {
    //   headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
    //   context: new HttpContext().set(IS_REFRESH_TOKEN, true)
    // });
    // 3. 拦截器中判断
    // if (req.context.get(IS_REFRESH_TOKEN)) return next(req);

    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // 这里的 token 必须是 refresh_token
    });
    console.log('Sending Token:', token)
    return this.http.post<any>(`${API_ENDPOINTS.AUTH.BASE}/refresh-token`, {}, { headers });
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
    return this.http.post(`${API_ENDPOINTS.AUTH.BASE}/register`, userData);
  }

  getUserRole() {
    return null;
  }
}
