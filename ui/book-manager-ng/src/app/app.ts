import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <!-- 顶部导航 -->
    <main>
      <router-outlet />
      <!-- 页面内容 -->
    </main>
  `,
})
export class App implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // 页面刷新时执行
    const token = localStorage.getItem('token');

    if (token) {
      // 如果本地有 token，调用 fetchUserProfile 重新填充 Signal 状态
      // 即使不订阅(subscribe)，由于 fetchUserProfile 内部有 tap 逻辑，
      // 只要后端返回 200，Signal 就会被更新。
      this.authService.fetchUserProfile().subscribe({
        error: () => {
          // 如果 Token 过期或非法，清理掉
          this.authService.logout();
        },
      });
    }
  }
}
