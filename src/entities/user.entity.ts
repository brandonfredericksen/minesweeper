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
import { Log } from './log.entity';

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

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
