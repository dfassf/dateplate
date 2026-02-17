import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter.js';

const createHttpHost = (url: string) => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const request = {
    method: 'POST',
    url,
  };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
};

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('handles HttpException and flattens validation message array', () => {
    const { host, response } = createHttpHost('/auth/register');

    filter.catch(new BadRequestException(['email must be an email', 'password should not be empty']), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: null,
        statusCode: 400,
        path: '/auth/register',
        message: 'email must be an email, password should not be empty',
      }),
    );
  });

  it('maps Prisma unique constraint errors to 409 response', () => {
    const { host, response } = createHttpHost('/gamification/tickets');

    filter.catch({ code: 'P2002' }, host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: null,
        statusCode: 409,
        message: '중복된 데이터가 존재합니다',
      }),
    );
  });

  it('maps Prisma not-found errors to 404 response', () => {
    const { host, response } = createHttpHost('/dinners/missing-id');

    filter.catch({ code: 'P2025' }, host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
      }),
    );
  });

  it('handles HttpException with string response body', () => {
    const { host, response } = createHttpHost('/teams');

    filter.catch(new HttpException('직접 메시지', HttpStatus.BAD_REQUEST), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '직접 메시지',
        statusCode: 400,
      }),
    );
  });

  it('logs and maps unknown errors to 500 response', () => {
    const { host, response } = createHttpHost('/stats/team-1');
    const loggerErrorSpy = jest.spyOn(
      (filter as unknown as { logger: { error: (msg: string, stack?: string) => void } }).logger,
      'error',
    ).mockImplementation(() => undefined);
    const unknownError = new Error('unexpected crash');

    filter.catch(unknownError, host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: '서버 내부 오류가 발생했습니다',
        error: 'Internal Server Error',
      }),
    );
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    loggerErrorSpy.mockRestore();
  });
});
