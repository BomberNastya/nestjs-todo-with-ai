import { TaskStatus } from './task-status.enum';

export interface Task {
  id: string;
  status: TaskStatus;
  title: string;
  description: string;
  userId: string;
}
