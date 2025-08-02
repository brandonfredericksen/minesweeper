import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Game } from './game.entity';

export enum LogAction {
  GAME_CREATE_ATTEMPT = 'GAME_CREATE_ATTEMPT',
  GAME_CREATE_SUCCESS = 'GAME_CREATE_SUCCESS',
  GAME_CREATE_FAILED = 'GAME_CREATE_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTH_FAILED = 'AUTH_FAILED',
}

@Entity({ name: 'game_logs' })
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class GameLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: LogAction,
    enumName: 'log_action_enum',
  })
  action: LogAction;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @ManyToOne(() => Game, { nullable: true })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ name: 'game_id', nullable: true })
  gameId: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
