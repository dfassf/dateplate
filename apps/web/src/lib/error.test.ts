import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
  it('returns axios response message when it is a string', () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: '권한이 없습니다' } },
    };

    expect(getErrorMessage(error, '알 수 없는 오류')).toBe('권한이 없습니다');
  });

  it('returns joined axios messages when message is an array', () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: ['이메일 형식이 올바르지 않습니다', '비밀번호가 너무 짧습니다'] } },
    };

    expect(getErrorMessage(error, '알 수 없는 오류')).toBe(
      '이메일 형식이 올바르지 않습니다, 비밀번호가 너무 짧습니다',
    );
  });

  it('returns native Error message for non-axios errors', () => {
    const error = new Error('네트워크 오류');

    expect(getErrorMessage(error, '알 수 없는 오류')).toBe('네트워크 오류');
  });

  it('returns fallback for unknown error values', () => {
    expect(getErrorMessage(null, '알 수 없는 오류')).toBe('알 수 없는 오류');
  });
});
