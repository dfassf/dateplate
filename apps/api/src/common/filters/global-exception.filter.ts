import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type PrismaLikeError = {
  code?: string;
};

type ErrorResponse = {
  data: null;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.mapException(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`[${request.method}] ${request.url} ${message}`, stack);
    }

    const payload: ErrorResponse = {
      data: null,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
    };

    response.status(statusCode).json(payload);
  }

  private mapException(exception: unknown): { statusCode: number; message: string; error: string } {
    if (exception instanceof HttpException) {
      return this.mapHttpException(exception);
    }

    if (this.isPrismaKnownError(exception)) {
      return this.mapPrismaError(exception.code);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 내부 오류가 발생했습니다',
      error: 'Internal Server Error',
    };
  }

  private mapHttpException(exception: HttpException) {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        statusCode,
        message: response,
        error: exception.name,
      };
    }

    if (response && typeof response === 'object') {
      const responseBody = response as { message?: string | string[]; error?: string };
      const rawMessage = responseBody.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;

      return {
        statusCode,
        message: typeof message === 'string' && message.trim() ? message : exception.message,
        error: responseBody.error ?? exception.name,
      };
    }

    return {
      statusCode,
      message: exception.message,
      error: exception.name,
    };
  }

  private mapPrismaError(code: string | undefined) {
    switch (code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: '중복된 데이터가 존재합니다',
          error: 'Conflict',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: '요청한 데이터를 찾을 수 없습니다',
          error: 'Not Found',
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '데이터 처리 중 오류가 발생했습니다',
          error: 'Bad Request',
        };
    }
  }

  private isPrismaKnownError(exception: unknown): exception is PrismaLikeError {
    return typeof exception === 'object' && exception !== null && 'code' in exception;
  }
}
