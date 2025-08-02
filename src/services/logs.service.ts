import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameLog, LogAction } from '../entities';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(GameLog)
    private readonly logsRepository: Repository<GameLog>,
  ) {}

  async logAction(
    userId: string,
    action: LogAction,
    ipAddress?: string,
    userAgent?: string,
    gameId?: string,
    details?: string,
  ): Promise<GameLog> {
    const log = this.logsRepository.create({
      userId,
      action,
      ipAddress,
      userAgent,
      gameId,
      details,
    });
    return this.logsRepository.save(log);
  }

  async getLogsByUser(userId: string, limit: number = 50): Promise<GameLog[]> {
    return this.logsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getLogsByAction(
    action: LogAction,
    limit: number = 100,
  ): Promise<GameLog[]> {
    return this.logsRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
