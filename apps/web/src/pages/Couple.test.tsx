import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import Couple from './Couple';
import { couplesApi } from '../lib/api';

// API mock
vi.mock('../lib/api', () => ({
  couplesApi: {
    getMyCouple: vi.fn(),
    getMyPendingInvite: vi.fn(),
    createInvite: vi.fn(),
    acceptInvite: vi.fn(),
  },
}));

const mockCouplesApi = vi.mocked(couplesApi);

describe('Couple', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('로딩 상태', () => {
    it('로딩 중 표시', () => {
      mockCouplesApi.getMyCouple.mockImplementation(() => new Promise(() => {}));
      mockCouplesApi.getMyPendingInvite.mockImplementation(() => new Promise(() => {}));

      render(<Couple />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });
  });

  describe('커플 미연결 상태', () => {
    beforeEach(() => {
      mockCouplesApi.getMyCouple.mockResolvedValue(null);
      mockCouplesApi.getMyPendingInvite.mockResolvedValue(null);
    });

    it('커플 연결 페이지 표시', async () => {
      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByText('커플 연결')).toBeInTheDocument();
      });

      // h2 제목들 확인
      expect(screen.getByRole('heading', { name: '초대 코드 생성' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '초대 코드 입력' })).toBeInTheDocument();
    });

    it('초대 코드 생성 폼 제출', async () => {
      const user = userEvent.setup();
      mockCouplesApi.createInvite.mockResolvedValue({
        inviteCode: 'ABCD1234',
        expiresAt: '2025-12-31T23:59:59Z',
      });

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '초대 코드 생성' })).toBeInTheDocument();
      });

      const coupleNameInput = screen.getByPlaceholderText('예: 우리 커플');
      await user.type(coupleNameInput, '테스트커플');

      const createButton = screen.getByRole('button', { name: '초대 코드 생성' });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCouplesApi.createInvite).toHaveBeenCalledWith('테스트커플');
      });

      await waitFor(() => {
        expect(screen.getByText('ABCD1234')).toBeInTheDocument();
      });
    });

    it('초대 코드 입력 및 수락', async () => {
      const user = userEvent.setup();
      const mockCouple = {
        id: 'couple-1',
        name: '테스트커플',
        profileUrl: null,
        user1: { id: 'user-1', email: 'user1@test.com', name: '유저1' },
        user2: { id: 'user-2', email: 'user2@test.com', name: '유저2' },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      mockCouplesApi.acceptInvite.mockResolvedValue(mockCouple);

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByText('초대 코드 입력')).toBeInTheDocument();
      });

      const codeInput = screen.getByPlaceholderText('8자리 코드 입력');
      await user.type(codeInput, 'ABCD1234');

      const acceptButton = screen.getByRole('button', { name: '커플 연결하기' });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(mockCouplesApi.acceptInvite).toHaveBeenCalledWith('ABCD1234');
      });
    });

    it('초대 코드가 8자리 미만이면 버튼 비활성화', async () => {
      const user = userEvent.setup();

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByText('초대 코드 입력')).toBeInTheDocument();
      });

      const codeInput = screen.getByPlaceholderText('8자리 코드 입력');
      await user.type(codeInput, 'ABC');

      const acceptButton = screen.getByRole('button', { name: '커플 연결하기' });
      expect(acceptButton).toBeDisabled();
    });
  });

  describe('이미 생성한 초대가 있는 경우', () => {
    it('초대 코드 표시', async () => {
      mockCouplesApi.getMyCouple.mockResolvedValue(null);
      mockCouplesApi.getMyPendingInvite.mockResolvedValue({
        id: 'invite-1',
        inviteCode: 'WXYZ5678',
        coupleName: '테스트커플',
        expiresAt: '2025-12-31T23:59:59Z',
      });

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByText('WXYZ5678')).toBeInTheDocument();
      });

      expect(screen.getByText('초대 코드가 생성되었습니다')).toBeInTheDocument();
    });

    it('코드 복사 버튼 클릭', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      mockCouplesApi.getMyCouple.mockResolvedValue(null);
      mockCouplesApi.getMyPendingInvite.mockResolvedValue({
        id: 'invite-1',
        inviteCode: 'WXYZ5678',
        coupleName: '테스트커플',
        expiresAt: '2025-12-31T23:59:59Z',
      });

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByText('WXYZ5678')).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: '코드 복사하기' });
      await user.click(copyButton);

      // 클립보드 복사 후 alert이 호출되는지 확인
      expect(alertSpy).toHaveBeenCalledWith('초대 코드가 복사되었습니다!');
      alertSpy.mockRestore();
    });
  });

  describe('이미 커플인 경우', () => {
    it('커플 정보 표시', async () => {
      const mockCouple = {
        id: 'couple-1',
        name: '사랑둥이',
        profileUrl: null,
        user1: { id: 'user-1', email: 'user1@test.com', name: '철수' },
        user2: { id: 'user-2', email: 'user2@test.com', name: '영희' },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      mockCouplesApi.getMyCouple.mockResolvedValue(mockCouple);
      mockCouplesApi.getMyPendingInvite.mockResolvedValue(null);

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByText('사랑둥이')).toBeInTheDocument();
      });

      expect(screen.getByText('철수')).toBeInTheDocument();
      expect(screen.getByText('영희')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '대시보드로 이동' })).toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    it('초대 생성 실패 시 에러 메시지 표시', async () => {
      const user = userEvent.setup();
      mockCouplesApi.getMyCouple.mockResolvedValue(null);
      mockCouplesApi.getMyPendingInvite.mockResolvedValue(null);
      mockCouplesApi.createInvite.mockRejectedValue(new Error('이미 커플로 등록되어 있습니다'));

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '초대 코드 생성' })).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: '초대 코드 생성' });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('이미 커플로 등록되어 있습니다')).toBeInTheDocument();
      });
    });

    it('초대 수락 실패 시 에러 메시지 표시', async () => {
      const user = userEvent.setup();
      mockCouplesApi.getMyCouple.mockResolvedValue(null);
      mockCouplesApi.getMyPendingInvite.mockResolvedValue(null);
      mockCouplesApi.acceptInvite.mockRejectedValue(new Error('유효하지 않은 초대 코드입니다'));

      render(<Couple />);

      await waitFor(() => {
        expect(screen.getByText('초대 코드 입력')).toBeInTheDocument();
      });

      const codeInput = screen.getByPlaceholderText('8자리 코드 입력');
      await user.type(codeInput, 'INVALID1');

      const acceptButton = screen.getByRole('button', { name: '커플 연결하기' });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByText('유효하지 않은 초대 코드입니다')).toBeInTheDocument();
      });
    });
  });
});
