import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../entities';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logsRepository: Repository<Log>,
  ) {}

  async logRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    responseTime?: number,
    details?: string,
  ): Promise<Log> {
    const log = this.logsRepository.create({
      method,
      endpoint,
      statusCode,
      userId,
      ipAddress,
      userAgent,
      responseTime,
      details,
    });
    return this.logsRepository.save(log);
  }

  async getLogsByUser(userId: string, limit: number = 50): Promise<Log[]> {
    return this.logsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getLogsByEndpoint(
    endpoint: string,
    limit: number = 100,
  ): Promise<Log[]> {
    return this.logsRepository.find({
      where: { endpoint },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getLogsByStatusCode(
    statusCode: number,
    limit: number = 100,
  ): Promise<Log[]> {
    return this.logsRepository.find({
      where: { statusCode },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
