import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { LogPipe } from '@shared/pipes/log.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [LogPipe], // 必須在這裡或全局註冊為 Provider
  template: `
    <div class="auth-container">
      <h2>新用户注册</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
        <input type="text" formControlName="firstname" placeholder="设置用户姓" /><br />
        <input type="text" formControlName="lastname" placeholder="设置用户名" /><br />
        <input type="email" formControlName="email" placeholder="电子邮箱" /><br />
        <input type="password" formControlName="password" placeholder="设置密码" /><br />
        <input type="password" formControlName="confirmPassword" placeholder="确认密码" /><br />
        <button type="submit" [disabled]="registerForm.invalid">提交注册</button>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private logPipe = inject(LogPipe);
  private authService = inject(AuthService);
  private router = inject(Router);

  // 自定义验证器：检查两个字段是否匹配
  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    // 如果两个控件都存在且值不相等，返回错误对象
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  };

  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  registerForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    role: ['USER'],
  }, { 
    // 关键点：在组级别添加验证器
    validators: this.passwordMatchValidator 
  });

  onRegister() {
    if (this.registerForm.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const userData = this.registerForm.getRawValue();
    this.logPipe.transform(userData);
    this.authService.register(userData).subscribe({
      next: (response) => {
        this.logPipe.transform(response);
        alert('注册成功！请登录。');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || '注册失败，请稍后再试。');
      },
    });
  }
}
