import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTaskDto } from '../task/create-task.dto';
import { TaskStatus } from '../task/task-status.enum';
import { Task } from '../task/task.interface';
import { UpdateTaskDto } from 'src/task/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  public getAllTasks(): Task[] {
    return this.tasks;
  }

  public getOneTask(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  public createTask(task: CreateTaskDto): Task {
    const newTask: Task = {
      ...task,
      id: randomUUID(),
      status: task.status ?? TaskStatus.TODO,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  public updateTask(id: string, task: UpdateTaskDto): Task {
    const existingTask = this.getOneTask(id);
    const updatedTask = Object.assign(existingTask, task);
    return updatedTask;
  }

  public deleteTask(id: string): void {
    const existingTask = this.getOneTask(id);
    if (!existingTask) {
      throw new NotFoundException();
    }
    this.tasks = this.tasks.filter((task) => task.id !== existingTask.id);
  }
}
