import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    const data = this.loginForm.getRawValue();
    this.authService.login(data).subscribe((res) => {
      if (res) {
        this.router.navigate(['/dashboard']).then((success) => {
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
