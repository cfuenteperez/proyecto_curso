import type { IceScore } from './IceScore';

export type TaskStatus = 'pending' | 'completed';

export interface Task extends IceScore {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export type NewTask = Omit<Task, 'id' | 'status'>;

export type TaskUpdate = Partial<Omit<Task, 'id'>>;
