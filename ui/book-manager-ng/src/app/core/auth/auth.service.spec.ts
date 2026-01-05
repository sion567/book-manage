import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // 创建 Router 的模拟对象
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // 测试前清空缓存
    localStorage.clear();
  });

  afterEach(() => {
    // 验证是否所有请求都已处理
    httpMock.verify();
  });

  it('1. 应该成功创建服务实例', () => {
    expect(service).toBeTruthy();
  });

  it('2. 初始状态下 isLoggedIn 应该为 false', () => {
    // 测试 Signal 的初始值
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('3. 登录成功后应该更新 Signal 状态并保存 Token', () => {
    const mockResponse = {
      token: 'fake-jwt-token',
      user: { username: 'admin' }
    };
    const credentials = { username: 'admin', password: 'password123' };

    // 订阅登录方法
    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse); // 触发返回

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.currentUser()?.username).toBe('admin');
    
    // 验证 LocalStorage
    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
  });

  it('4. 登录失败时不应该更新状态', () => {
    service.login({ username: 'wrong', password: 'bar' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.error(new ProgressEvent('Network Error'), { status: 401 });

    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('5. 执行 logout 后应该清空所有状态', () => {
    //service.currentUser.set({ username: 'admin' });
    localStorage.setItem('token', 'some-token');

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    //expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
