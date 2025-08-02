import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Game } from './game.entity';
import { GameLog } from './game-log.entity';

@Entity({ name: 'users' })
@Index(['username'], { unique: true })
@Index(['apiKey'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'api_key', unique: true })
  apiKey: string;

  @OneToMany(() => Game, (game) => game.user)
  games: Game[];

  @OneToMany(() => GameLog, (log) => log.user)
  logs: GameLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
