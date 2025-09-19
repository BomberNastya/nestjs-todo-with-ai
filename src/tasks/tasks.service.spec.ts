import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from '../task/create-task.dto';
import { UpdateTaskDto } from '../task/update-task.dto';
import { TaskStatus } from '../task/task-status.enum';
import type { Task } from '../task/task.interface';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('should return an empty array when no tasks exist', () => {
      const result = service.getAllTasks('user1');
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return only tasks for the specified user', () => {
      const createTaskDto1: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'User 1 Task',
        description: 'Task for user 1',
        userId: 'user1',
      };

      const createTaskDto2: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'User 2 Task',
        description: 'Task for user 2',
        userId: 'user2',
      };

      service.createTask(createTaskDto1);
      service.createTask(createTaskDto2);

      const user1Tasks = service.getAllTasks('user1');
      const user2Tasks = service.getAllTasks('user2');

      expect(user1Tasks).toHaveLength(1);
      expect(user2Tasks).toHaveLength(1);
      expect(user1Tasks[0].userId).toBe('user1');
      expect(user2Tasks[0].userId).toBe('user2');
    });

    it('should return all tasks for a user in order of creation', () => {
      const createTaskDto1: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'First Task',
        description: 'First task description',
        userId: 'user1',
      };

      const createTaskDto2: CreateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
        title: 'Second Task',
        description: 'Second task description',
        userId: 'user1',
      };

      const task1 = service.createTask(createTaskDto1);
      const task2 = service.createTask(createTaskDto2);

      const tasks = service.getAllTasks('user1');
      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe(task1.id);
      expect(tasks[1].id).toBe(task2.id);
    });
  });

  describe('getTaskById', () => {
    it('should return a task when it exists and belongs to the user', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Test Task',
        description: 'Test description',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);
      const result = service.getTaskById(createdTask.id, 'user1');

      expect(result).toEqual(createdTask);
    });

    it('should throw NotFoundException when task does not exist', () => {
      expect(() => {
        service.getTaskById(999, 'user1');
      }).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when task exists but belongs to different user', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Test Task',
        description: 'Test description',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      expect(() => {
        service.getTaskById(createdTask.id, 'user2');
      }).toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('should create and return a new task with generated ID', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'New Task',
        description: 'New task description',
        userId: 'user1',
      };

      const result = service.createTask(createTaskDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('number');
      expect(result.status).toBe(createTaskDto.status);
      expect(result.title).toBe(createTaskDto.title);
      expect(result.description).toBe(createTaskDto.description);
      expect(result.userId).toBe(createTaskDto.userId);
    });

    it('should generate unique IDs for different tasks', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task',
        description: 'Description',
        userId: 'user1',
      };

      const task1 = service.createTask(createTaskDto);
      const task2 = service.createTask(createTaskDto);

      expect(task1.id).not.toBe(task2.id);
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

      const todoResult = service.createTask(todoTask);
      const inProgressResult = service.createTask(inProgressTask);
      const doneResult = service.createTask(doneTask);

      expect(todoResult.status).toBe(TaskStatus.TODO);
      expect(inProgressResult.status).toBe(TaskStatus.IN_PROGRESS);
      expect(doneResult.status).toBe(TaskStatus.DONE);
    });

    it('should store the task so it can be retrieved', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Stored Task',
        description: 'This task should be stored',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);
      const retrievedTask = service.getTaskById(createdTask.id, 'user1');

      expect(retrievedTask).toEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update and return the updated task', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Original Task',
        description: 'Original description',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
        title: 'Updated Task',
      };

      const result = service.updateTask(createdTask.id, updateTaskDto, 'user1');

      expect(result.id).toBe(createdTask.id);
      expect(result.status).toBe(updateTaskDto.status);
      expect(result.title).toBe(updateTaskDto.title);
      expect(result.description).toBe(createdTask.description); // Should remain unchanged
      expect(result.userId).toBe(createdTask.userId);
    });

    it('should handle partial updates', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Original Task',
        description: 'Original description',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };

      const result = service.updateTask(createdTask.id, updateTaskDto, 'user1');

      expect(result.status).toBe(TaskStatus.DONE);
      expect(result.title).toBe(createdTask.title); // Should remain unchanged
      expect(result.description).toBe(createdTask.description); // Should remain unchanged
    });

    it('should handle full updates', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Original Task',
        description: 'Original description',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
        title: 'Completely Updated Task',
        description: 'Completely updated description',
        userId: 'user1', // This should not change the userId
      };

      const result = service.updateTask(createdTask.id, updateTaskDto, 'user1');

      expect(result.status).toBe(updateTaskDto.status);
      expect(result.title).toBe(updateTaskDto.title);
      expect(result.description).toBe(updateTaskDto.description);
      expect(result.userId).toBe(createdTask.userId); // Should remain the original userId
    });

    it('should throw NotFoundException when task does not exist', () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };

      expect(() => {
        service.updateTask(999, updateTaskDto, 'user1');
      }).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when task belongs to different user', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'User 1 Task',
        description: 'Task for user 1',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };

      expect(() => {
        service.updateTask(createdTask.id, updateTaskDto, 'user2');
      }).toThrow(NotFoundException);
    });

    it('should persist the update so it can be retrieved', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task to Update',
        description: 'Original description',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
        title: 'Updated Task Title',
      };

      service.updateTask(createdTask.id, updateTaskDto, 'user1');
      const retrievedTask = service.getTaskById(createdTask.id, 'user1');

      expect(retrievedTask.status).toBe(TaskStatus.DONE);
      expect(retrievedTask.title).toBe('Updated Task Title');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and return void', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task to Delete',
        description: 'This task will be deleted',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      const result = service.deleteTask(createdTask.id, 'user1');
      expect(result).toBeUndefined();
    });

    it('should remove the task so it cannot be retrieved', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task to Delete',
        description: 'This task will be deleted',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      service.deleteTask(createdTask.id, 'user1');

      expect(() => {
        service.getTaskById(createdTask.id, 'user1');
      }).toThrow(NotFoundException);
    });

    it('should remove the task from getAllTasks results', () => {
      const createTaskDto1: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task 1',
        description: 'First task',
        userId: 'user1',
      };

      const createTaskDto2: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task 2',
        description: 'Second task',
        userId: 'user1',
      };

      const task1 = service.createTask(createTaskDto1);
      const task2 = service.createTask(createTaskDto2);

      expect(service.getAllTasks('user1')).toHaveLength(2);

      service.deleteTask(task1.id, 'user1');

      const remainingTasks = service.getAllTasks('user1');
      expect(remainingTasks).toHaveLength(1);
      expect(remainingTasks[0].id).toBe(task2.id);
    });

    it('should throw NotFoundException when task does not exist', () => {
      expect(() => {
        service.deleteTask(999, 'user1');
      }).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when task belongs to different user', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'User 1 Task',
        description: 'Task for user 1',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      expect(() => {
        service.deleteTask(createdTask.id, 'user2');
      }).toThrow(NotFoundException);
    });
  });

  describe('edge cases and data integrity', () => {
    it('should handle empty string userIds consistently', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Task with empty userId',
        description: 'Testing empty userId',
        userId: '',
      };

      const createdTask = service.createTask(createTaskDto);
      const retrievedTask = service.getTaskById(createdTask.id, '');

      expect(retrievedTask).toEqual(createdTask);
    });

    it('should maintain data consistency across operations', () => {
      const createTaskDto: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'Consistency Test',
        description: 'Testing data consistency',
        userId: 'user1',
      };

      const createdTask = service.createTask(createTaskDto);

      // Verify creation
      expect(service.getAllTasks('user1')).toHaveLength(1);

      // Update and verify
      const updateTaskDto: UpdateTaskDto = { status: TaskStatus.DONE };
      service.updateTask(createdTask.id, updateTaskDto, 'user1');

      const updatedTask = service.getTaskById(createdTask.id, 'user1');
      expect(updatedTask.status).toBe(TaskStatus.DONE);

      // Verify still in getAllTasks
      expect(service.getAllTasks('user1')).toHaveLength(1);
      expect(service.getAllTasks('user1')[0].status).toBe(TaskStatus.DONE);
    });

    it('should handle multiple users independently', () => {
      const user1Task: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'User 1 Task',
        description: 'Task for user 1',
        userId: 'user1',
      };

      const user2Task: CreateTaskDto = {
        status: TaskStatus.TODO,
        title: 'User 2 Task',
        description: 'Task for user 2',
        userId: 'user2',
      };

      const task1 = service.createTask(user1Task);
      const task2 = service.createTask(user2Task);

      // Delete user1's task
      service.deleteTask(task1.id, 'user1');

      // User2's task should still exist
      expect(service.getAllTasks('user1')).toHaveLength(0);
      expect(service.getAllTasks('user2')).toHaveLength(1);
      expect(service.getTaskById(task2.id, 'user2')).toEqual(task2);
    });
  });
});
