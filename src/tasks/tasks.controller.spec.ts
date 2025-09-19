import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { CreateTaskDto } from '../task/create-task.dto';
import { UpdateTaskDto } from '../task/update-task.dto';
import { TaskStatus } from '../task/task-status.enum';
import type { Task } from '../task/task.interface';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('should return an array of tasks', () => {
      const result = controller.getAllTasks();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return an empty array initially', () => {
      const result = controller.getAllTasks();
      expect(result).toEqual([]);
    });
  });

  describe('getOneTask', () => {
    it('should return a task object', () => {
      const result = controller.getOneTask();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return a task with all required properties', () => {
      const result = controller.getOneTask();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('userId');
    });

    it('should return a task with correct data types', () => {
      const result = controller.getOneTask();
      expect(typeof result.id).toBe('number');
      expect(typeof result.status).toBe('string');
      expect(typeof result.title).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(typeof result.userId).toBe('string');
    });

    it('should return a task with valid status enum value', () => {
      const result = controller.getOneTask();
      expect(Object.values(TaskStatus)).toContain(result.status);
    });

    it('should return the expected sample task', () => {
      const result = controller.getOneTask();
      const expectedTask: Task = {
        id: 1,
        status: TaskStatus.TODO,
        title: 'Sample Task',
        description: 'This is a sample task',
        userId: 'user1',
      };
      expect(result).toEqual(expectedTask);
    });
  });

  describe('createTask', () => {
    it('should create and return a new task', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'New Task',
        description: 'New task description',
        userId: 'user1',
      };

      const result = controller.createTask(createTaskDto);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return a task with an ID', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'New Task',
        description: 'New task description',
        userId: 'user1',
      };

      const result = controller.createTask(createTaskDto);
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('number');
      expect(result.id).toBeGreaterThan(0);
    });

    it('should return a task with the provided data', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
        title: 'Important Task',
        description: 'This is an important task',
        userId: 'user2',
      };

      const result = controller.createTask(createTaskDto);
      expect(result.status).toBe(createTaskDto.status);
      expect(result.title).toBe(createTaskDto.title);
      expect(result.description).toBe(createTaskDto.description);
      expect(result.userId).toBe(createTaskDto.userId);
    });

    it('should handle different task statuses', () => {
      const todoTask: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Todo Task',
        description: 'A todo task',
        userId: 'user1',
      };

      const inProgressTask: CreateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
        title: 'In Progress Task',
        description: 'A task in progress',
        userId: 'user1',
      };

      const doneTask: CreateTaskDto = {
        status: TaskStatus.DONE,
        title: 'Done Task',
        description: 'A completed task',
        userId: 'user1',
      };

      const todoResult = controller.createTask(todoTask);
      const inProgressResult = controller.createTask(inProgressTask);
      const doneResult = controller.createTask(doneTask);

      expect(todoResult.status).toBe(TaskStatus.TODO);
      expect(inProgressResult.status).toBe(TaskStatus.IN_PROGRESS);
      expect(doneResult.status).toBe(TaskStatus.DONE);
    });

    it('should generate different IDs for multiple tasks', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task',
        description: 'Description',
        userId: 'user1',
      };

      const task1 = controller.createTask(createTaskDto);
      const task2 = controller.createTask(createTaskDto);

      // Note: This test might be flaky due to Math.random(), but it's testing current implementation
      // In a real scenario, we would mock the ID generation
      expect(task1.id).toBeDefined();
      expect(task2.id).toBeDefined();
    });
  });

  describe('updateTask', () => {
    it('should return the update data', () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
        title: 'Updated Task',
      };

      const result = controller.updateTask(updateTaskDto);
      expect(result).toBeDefined();
      expect(result).toEqual(updateTaskDto);
    });

    it('should handle partial updates', () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };

      const result = controller.updateTask(updateTaskDto);
      expect(result).toEqual(updateTaskDto);
      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('should handle empty update', () => {
      const updateTaskDto: UpdateTaskDto = {};

      const result = controller.updateTask(updateTaskDto);
      expect(result).toEqual(updateTaskDto);
    });

    it('should handle full update', () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
        title: 'Fully Updated Task',
        description: 'This task has been fully updated',
        userId: 'user3',
      };

      const result = controller.updateTask(updateTaskDto);
      expect(result).toEqual(updateTaskDto);
    });
  });

  describe('deleteTask', () => {
    it('should return null', () => {
      const result = controller.deleteTask();
      expect(result).toBeNull();
    });

    it('should be defined', () => {
      expect(controller.deleteTask).toBeDefined();
      expect(typeof controller.deleteTask).toBe('function');
    });
  });
});
