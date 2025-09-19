import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { CreateTaskDto } from '../task/create-task.dto';
import { TaskStatus } from '../task/task-status.enum';
import type { Task } from '../task/task.interface';
import { UpdateTaskDto } from '../task/update-task.dto';

@Controller('tasks')
export class TasksController {
  @Get()
  getAllTasks(): Task[] {
    return [];
  }

  @Get(':id')
  getOneTask(): Task {
    const dummyTask: Task = {
      id: 1,
      status: TaskStatus.TODO,
      title: 'Sample Task',
      description: 'This is a sample task',
      userId: 'user1',
    };
    return dummyTask;
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
    const newTask: Task = {
      id: Math.floor(Math.random() * 1000), // Dummy ID generation
      ...createTaskDto,
    };
    return newTask;
  }

  @Put(':id')
  updateTask(@Body() updateTaskDto: UpdateTaskDto) {
    return updateTaskDto;
  }

  @Delete(':id')
  deleteTask() {
    return null;
  }
}
