import axios from 'axios';

interface ErrorPayload {
  message?: string | string[];
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (Array.isArray(message) && message.length > 0) {
      return message.join(', ');
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
