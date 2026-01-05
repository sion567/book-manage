import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h2>用户登录</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <input type="text" formControlName="email" placeholder="邮箱" /><br/>
        <input type="password" formControlName="password" placeholder="密码" /><br/>
        <button type="submit" [disabled]="loginForm.invalid">登录</button>
      </form>

      @if (errorMessage) {
        <p style="color: red;">{{ errorMessage }}</p>
      }
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    const data = this.loginForm.getRawValue();
    this.authService.login(data).subscribe(res => {
        if (res) {
          this.router.navigate(['/dashboard']).then(success => {
            if (!success) {
              console.error('跳转失败！请检查路由守卫或路径配置');
            }
          });
        } else {
          alert('登录失败，请检查账号密码');
        }
    });
  }
}
