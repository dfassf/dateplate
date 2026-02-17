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

  it('findById should throw NotFoundException when team does not exist', async () => {
    prismaMock.team.findUnique.mockResolvedValue(null);

    await expect(service.findById('missing-team')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should throw ForbiddenException when requester is not leader', async () => {
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

  it('acceptInvite should mark invite as expired and throw ConflictException', async () => {
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
  });

  it('acceptInvite should add member and mark invite accepted when invite is valid', async () => {
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

  it('remove should delete related records in a transaction for leader', async () => {
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
