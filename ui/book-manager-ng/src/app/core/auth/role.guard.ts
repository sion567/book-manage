import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// 工厂函数写法，这是一个“高阶函数”。它本身不是 Guard，它是一个用来生成 Guard 的函数。返回 CanActivateFn 的函数
// 特点：
// 可传参：允许你在定义路由时动态传入参数（如角色名称）。
// 灵活性：同一个工厂函数可以根据参数生成不同的 Guard 逻辑。
// 使用：{ path: 'admin', canActivate: [roleGuard('ADMIN')] }
export const roleGuard = (requiredRole: string): CanActivateFn => {
  // 这部分是工厂返回的“产品” (真正的 Guard)
  return () => {
    const router = inject(Router);

    const userRole = inject(AuthService).getUserRole(); 

    if (userRole === requiredRole) {
      return true;
    }

    alert('您没有权限访问此页面');
    return router.parseUrl('/unauthorized');
  };
};

// 工厂函数 = 配置 + 闭包 + 模板代码。 它是函数式编程中一种非常优雅的创建可配置逻辑的方式。
/*
function createMultiplier(multiplier) {
  // 返回一个新的函数
  return function(value) {
    return value * multiplier; // 内部函数记住了外部的 multiplier 变量
  };
}

const double = createMultiplier(2); // 生产一个“翻倍”函数
const triple = createMultiplier(3); // 生产一个“三倍”函数

console.log(double(5)); // 10
console.log(triple(5)); // 15
*/