import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { GameCell } from './game-cell.entity';
import { User } from './user.entity';

export enum GameStatus {
  Pending = 'PENDING',
  Cleared = 'CLEARED',
  Detonated = 'DETONATED',
}

export enum GameDifficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  CUSTOM = 'CUSTOM',
}

@Entity({ name: 'games' })
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['difficulty', 'createdAt'])
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.games)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: GameStatus,
    enumName: 'game_status_enum',
    default: GameStatus.Pending,
  })
  status: GameStatus;

  @Column({
    type: 'enum',
    enum: GameDifficulty,
    enumName: 'game_difficulty_enum',
    default: GameDifficulty.NORMAL,
  })
  difficulty: GameDifficulty;

  @OneToMany(() => GameCell, (cell) => cell.game)
  cells: GameCell[];

  @Column()
  rows: number;

  @Column()
  columns: number;

  @Column({ name: 'bomb_density', type: 'decimal', precision: 5, scale: 4 })
  bombDensity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
