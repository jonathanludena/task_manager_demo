import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  title!: string;

  @Column('text', { default: '' })
  description!: string;

  @Column('boolean', { default: false })
  completed!: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  constructor(
    id?: string,
    title?: string,
    description?: string,
    completed?: boolean,
    createdAt?: Date,
  ) {
    if (id !== undefined) {
      this.id = id;
      this.title = title!;
      this.description = description ?? '';
      this.completed = completed ?? false;
      this.createdAt = createdAt ?? new Date();
    }
  }
}
