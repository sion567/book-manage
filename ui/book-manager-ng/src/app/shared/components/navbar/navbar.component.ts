import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  // 注入认证服务
  private authService = inject(AuthService);

  // 获取当前登录状态和用户信息的 Signal
  isLoggedIn = this.authService.isLoggedIn;
  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
