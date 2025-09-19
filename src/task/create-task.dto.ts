import { TaskStatus } from './task-status.enum';

export class CreateTaskDto {
  status: TaskStatus = TaskStatus.TODO;
  title: string;
  description: string;
  userId: string;
}
