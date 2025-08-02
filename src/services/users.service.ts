import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByApiKey(apiKey: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { apiKey } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async createUser(username: string, apiKey: string): Promise<User> {
    const user = this.usersRepository.create({
      username,
      apiKey,
    });
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  generateApiKey(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `minesweeper_${timestamp}_${random}`;
  }
}
