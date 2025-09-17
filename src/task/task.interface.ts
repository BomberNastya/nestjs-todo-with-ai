import { TaskStatus } from './task-status.enum';

export interface Task {
  id: number;
  status: TaskStatus;
  title: string;
  description: string;
  userId: string;
}
