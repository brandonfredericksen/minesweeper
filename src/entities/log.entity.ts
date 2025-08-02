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

@Entity({ name: 'logs' })
@Index(['userId', 'createdAt'])
@Index(['method', 'endpoint'])
@Index(['statusCode', 'createdAt'])
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.logs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ length: 10 })
  method: string;

  @Column()
  endpoint: string;

  @Column({ name: 'status_code' })
  statusCode: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'response_time', nullable: true })
  responseTime: number;

  @Column({ type: 'text', nullable: true })
  details: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
