import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { apiInterceptor } from '@core/interceptors/api.interceptor';
import { registerLocaleData } from '@angular/common';
import localeZh from '@angular/common/locales/zh-Hans';

registerLocaleData(localeZh); // 注册中文数据

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'zh-Hans' }, // 设置全局语言为中文
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
  ],
};

// id = input.required() 正常工作,需要withComponentInputBinding()
