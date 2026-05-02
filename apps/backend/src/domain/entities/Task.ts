import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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
