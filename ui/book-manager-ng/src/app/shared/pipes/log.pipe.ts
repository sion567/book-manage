import { Pipe, PipeTransform, isDevMode } from '@angular/core';

@Pipe({
  name: 'log',
  standalone: true,
})
export class LogPipe implements PipeTransform {
  /**
   * @param value
   * @param message
   */
  transform(value: any, message: string = 'Debug Log'): any {
    if (isDevMode()) {
      console.log(`[${new Date().toLocaleTimeString()}] ${message}:`, value);
    }

    // 必须将原值返回，否则模板渲染会中断或显示空
    return value;
  }
}
