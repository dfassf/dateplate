import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { TeamsService } from './teams.service.js';

describe('TeamsService', () => {
  const prismaMock = {
    team: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teamInvite: {
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    teamMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: TeamsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TeamsService(prismaMock as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates team with leader as initial team member', async () => {
      prismaMock.team.create.mockResolvedValue({ id: 'team-1' });

      await service.create('leader-1', 'Backend Team');

      expect(prismaMock.team.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            name: 'Backend Team',
            leaderId: 'leader-1',
            members: { create: { userId: 'leader-1', role: 'LEADER' } },
          },
          include: expect.objectContaining({
            members: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when team does not exist', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing-team')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException when requester is not leader', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        name: 'team',
        leaderId: 'leader-1',
        members: [],
      });

      await expect(service.update('team-1', 'member-1', { name: 'renamed' })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prismaMock.team.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws ForbiddenException when requester is not leader', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        members: [],
      });

      await expect(service.remove('team-1', 'member-1')).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('deletes related records in a transaction for leader', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        members: [],
      });
      prismaMock.$transaction.mockResolvedValue(undefined);

      const result = await service.remove('team-1', 'leader-1');

      expect(prismaMock.teamInvite.deleteMany).toHaveBeenCalledWith({ where: { teamId: 'team-1' } });
      expect(prismaMock.teamMember.deleteMany).toHaveBeenCalledWith({ where: { teamId: 'team-1' } });
      expect(prismaMock.team.delete).toHaveBeenCalledWith({ where: { id: 'team-1' } });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('removeMember', () => {
    beforeEach(() => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        members: [],
      });
    });

    it('throws ForbiddenException when requester is neither leader nor target member', async () => {
      await expect(service.removeMember('team-1', 'member-1', 'stranger-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prismaMock.teamMember.deleteMany).not.toHaveBeenCalled();
    });

    it('allows self-leave and deletes membership', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        leaderId: 'leader-1',
        members: [],
      });

      await service.removeMember('team-1', 'member-1', 'member-1');

      expect(prismaMock.teamMember.deleteMany).toHaveBeenCalledWith({
        where: { teamId: 'team-1', userId: 'member-1' },
      });
      expect(prismaMock.team.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('acceptInvite', () => {
    it('throws NotFoundException when invite does not exist or status is not pending', async () => {
      prismaMock.teamInvite.findUnique.mockResolvedValue(null);
      await expect(service.acceptInvite('user-1', 'INVALID')).rejects.toBeInstanceOf(NotFoundException);

      prismaMock.teamInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        teamId: 'team-1',
        status: 'ACCEPTED',
        expiresAt: new Date(Date.now() + 60_000),
      });
      await expect(service.acceptInvite('user-1', 'USED')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('marks invite as expired and throws ConflictException when invite is expired', async () => {
      prismaMock.teamInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        teamId: 'team-1',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.acceptInvite('user-1', 'CODE1234')).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.teamInvite.update).toHaveBeenCalledWith({
        where: { id: 'invite-1' },
        data: { status: 'EXPIRED' },
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('throws ConflictException when user is already a team member', async () => {
      prismaMock.teamInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        teamId: 'team-1',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 60_000),
      });
      prismaMock.teamMember.findFirst.mockResolvedValue({ id: 'member-1' });

      await expect(service.acceptInvite('user-1', 'CODE1234')).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('adds member and marks invite accepted when invite is valid', async () => {
      prismaMock.teamInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        teamId: 'team-1',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 60_000),
      });
      prismaMock.teamMember.findFirst.mockResolvedValue(null);
      prismaMock.$transaction.mockResolvedValue(undefined);
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        name: 'Backend Team',
        leaderId: 'leader-1',
        members: [],
      });

      const result = await service.acceptInvite('user-1', 'CODE1234');

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.teamMember.create).toHaveBeenCalledWith({
        data: { teamId: 'team-1', userId: 'user-1', role: 'MEMBER' },
      });
      expect(prismaMock.teamInvite.update).toHaveBeenCalledWith({
        where: { id: 'invite-1' },
        data: { status: 'ACCEPTED', inviteeId: 'user-1' },
      });
      expect(result).toEqual({
        id: 'team-1',
        name: 'Backend Team',
        leaderId: 'leader-1',
        members: [],
      });
    });
  });
});
