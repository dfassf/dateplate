import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, { data: T; message?: string }> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<{ data: T; message?: string }> {
    return next.handle().pipe(
      map((data) => {
        // 이미 ApiResponse 형식인 경우 그대로 반환
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }
        // 그 외의 경우 ApiResponse 형식으로 래핑
        return { data };
      }),
    );
  }
}
