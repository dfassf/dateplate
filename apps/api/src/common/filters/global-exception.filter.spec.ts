import { BadRequestException } from '@nestjs/common';
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
});
