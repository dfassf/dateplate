import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { data: T; message?: string }>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T; message?: string }> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }
        return { data };
      }),
    );
  }
}
