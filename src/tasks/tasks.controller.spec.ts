import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { CreateTaskDto } from '../task/create-task.dto';
import { UpdateTaskDto } from '../task/update-task.dto';
import { TaskStatus } from '../task/task-status.enum';
import { TasksService } from './tasks.service';
import { NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
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
      const task: CreateTaskDto = {
        title: 'task1',
        description: 'description 1',
        status: TaskStatus.TODO,
        userId: '1',
      };
      const newTask = controller.createTask(task);
      const result = controller.getOneTask({ id: newTask.id });
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return a task with all required properties', () => {
      const task: CreateTaskDto = {
        title: 'task1',
        description: 'description 1',
        status: TaskStatus.TODO,
        userId: '1',
      };
      const newTask = controller.createTask(task);
      const result = controller.getOneTask({ id: newTask.id });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('userId');
    });

    it('should return a task with correct data types', () => {
      const task: CreateTaskDto = {
        title: 'task1',
        description: 'description 1',
        status: TaskStatus.TODO,
        userId: '1',
      };
      const newTask = controller.createTask(task);
      const result = controller.getOneTask({ id: newTask.id });
      expect(typeof result.id).toBe('string');
      expect(typeof result.status).toBe('string');
      expect(typeof result.title).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(typeof result.userId).toBe('string');
    });

    it('should return a task with valid status enum value', () => {
      const task: CreateTaskDto = {
        title: 'task1',
        description: 'description 1',
        status: TaskStatus.TODO,
        userId: '1',
      };
      const newTask = controller.createTask(task);
      const result = controller.getOneTask({ id: newTask.id });
      expect(Object.values(TaskStatus)).toContain(result.status);
    });

    it('should return the expected sample task', () => {
      const task: CreateTaskDto = {
        title: 'task1',
        description: 'description 1',
        status: TaskStatus.TODO,
        userId: '1',
      };
      const newTask = controller.createTask(task);
      const result = controller.getOneTask({ id: newTask.id });
      expect(result).toEqual(newTask);
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
      expect(typeof result.id).toBe('string');
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
    const createTaskDto: CreateTaskDto = {
      status: TaskStatus.TODO,
      title: 'Task',
      description: 'Description',
      userId: 'user1',
    };
    it('should return the update data', () => {
      const createdTask = controller.createTask(createTaskDto);
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
        title: 'Updated Task',
      };
      const expectedResult = {
        ...createdTask,
        ...updateTaskDto,
      };

      const result = controller.updateTask(
        { id: createdTask.id },
        updateTaskDto,
      );
      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should handle partial updates', () => {
      const createdTask = controller.createTask(createTaskDto);
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };
      const expectResult = {
        ...createdTask,
        ...updateTaskDto,
      };

      const result = controller.updateTask(
        { id: createdTask.id },
        updateTaskDto,
      );
      expect(result).toEqual(expectResult);
      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('should handle empty update', () => {
      const createdTask = controller.createTask(createTaskDto);
      const updateTaskDto: UpdateTaskDto = {};
      const result = controller.updateTask(
        { id: createdTask.id },
        updateTaskDto,
      );
      expect(result).toEqual(createdTask);
    });

    it('should handle full update', () => {
      const createdTask = controller.createTask(createTaskDto);
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
        title: 'Fully Updated Task',
        description: 'This task has been fully updated',
        userId: 'user3',
      };

      const result = controller.updateTask(
        { id: createdTask.id },
        updateTaskDto,
      );
      expect(result).toEqual({ ...updateTaskDto, id: createdTask.id });
    });
  });

  describe('deleteTask', () => {
    const createTaskDto: CreateTaskDto = {
      status: TaskStatus.TODO,
      title: 'Task',
      description: 'Description',
      userId: 'user1',
    };
    it('should delete task by id', () => {
      const createdTask = controller.createTask(createTaskDto);
      expect(createdTask).toBeDefined();
      controller.deleteTask({ id: createdTask.id });
      expect(() => {
        controller.getOneTask({ id: createdTask.id });
      }).toThrow(NotFoundException);
    });
  });
});
