import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TaskStatus } from '../src/task/task-status.enum';
import { Task } from '../src/task/task.interface';

describe('TaskController (e2e)', () => {
  let app: INestApplication<App>;
  const hardcodedUserId = 'test-user-123';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /tasks', () => {
    it('should return empty array when no tasks exist for user', () => {
      return request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
    });

    it('should return all tasks for the user', async () => {
      // First create some tasks
      const task1 = {
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };
      const task2 = {
        title: 'Task 2',
        description: 'Description 2',
        status: TaskStatus.IN_PROGRESS,
        userId: hardcodedUserId,
      };

      await request(app.getHttpServer()).post('/tasks').send(task1).expect(201);

      await request(app.getHttpServer()).post('/tasks').send(task2).expect(201);

      // Then get all tasks
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          const tasks = res.body as Task[];
          expect(tasks).toHaveLength(2);
          expect(tasks[0]).toMatchObject({
            ...task1,
            userId: hardcodedUserId,
          });
          expect(tasks[1]).toMatchObject({
            ...task2,
            userId: hardcodedUserId,
          });
          expect(tasks[0]).toHaveProperty('id');
          expect(tasks[1]).toHaveProperty('id');
        });
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a specific task by id', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);

      const taskId = (createResponse.body as Task).id;

      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(200)
        .expect((res) => {
          const task = res.body as Task;
          expect(task).toMatchObject({
            ...taskData,
            id: taskId,
            userId: hardcodedUserId,
          });
        });
    });

    it('should return 404 when task does not exist', () => {
      const nonExistentId = 'non-existent-uuid';
      return request(app.getHttpServer())
        .get(`/tasks/${nonExistentId}`)
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toContain(
            `Task with ID "${nonExistentId}" not found`,
          );
        });
    });

    it('should return 404 when id is not found', () => {
      return request(app.getHttpServer())
        .get('/tasks/invalid-id')
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toContain(
            'Task with ID "invalid-id" not found',
          );
        });
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task with valid data', () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect(res.body as Task).toMatchObject({
            ...taskData,
            userId: hardcodedUserId,
          });
          expect(res.body as Task).toHaveProperty('id');
          expect(typeof (res.body as Task).id).toBe('string');
        });
    });

    it('should create a task with IN_PROGRESS status', () => {
      const taskData = {
        title: 'In Progress Task',
        description: 'Currently working on this',
        status: TaskStatus.IN_PROGRESS,
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect((res.body as Task).status).toBe(TaskStatus.IN_PROGRESS);
        });
    });

    it('should create a task with DONE status', () => {
      const taskData = {
        title: 'Completed Task',
        description: 'This task is finished',
        status: TaskStatus.DONE,
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect((res.body as Task).status).toBe(TaskStatus.DONE);
        });
    });

    it('should create task even when title is missing', () => {
      const taskData = {
        description: 'Missing title',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);
    });

    it('should create task even when title is empty string', () => {
      const taskData = {
        title: '',
        description: 'Empty title',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);
    });

    it('should create task even when description is missing', () => {
      const taskData = {
        title: 'Missing description',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);
    });

    it('should create task even with invalid status', () => {
      const taskData = {
        title: 'Invalid status',
        description: 'Testing invalid status',
        status: 'INVALID_STATUS',
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);
    });

    it('should create task with default TODO status when status is missing', () => {
      const taskData = {
        title: 'Missing status',
        description: 'No status provided',
        userId: hardcodedUserId,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect((res.body as Task).status).toBe(TaskStatus.TODO);
        });
    });
  });

  describe('PUT /tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Original Task',
        description: 'Original Description',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);

      taskId = (response.body as Task).id;
    });

    it('should update an existing task', () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.DONE,
      };

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body as Task).toMatchObject({
            ...updateData,
            id: taskId,
            userId: hardcodedUserId,
          });
        });
    });

    it('should update only the title', () => {
      const updateData = {
        title: 'Only Title Updated',
      };

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect((res.body as Task).title).toBe('Only Title Updated');
          expect((res.body as Task).description).toBe('Original Description');
          expect((res.body as Task).status).toBe(TaskStatus.TODO);
        });
    });

    it('should update only the status', () => {
      const updateData = {
        status: TaskStatus.IN_PROGRESS,
      };

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect((res.body as Task).status).toBe(TaskStatus.IN_PROGRESS);
          expect((res.body as Task).title).toBe('Original Task');
          expect((res.body as Task).description).toBe('Original Description');
        });
    });

    it('should return 404 when task does not exist', () => {
      const nonExistentId = 'non-existent-uuid';
      const updateData = {
        title: 'Non-existent task',
        description: 'This should fail',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .put(`/tasks/${nonExistentId}`)
        .send(updateData)
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toContain(
            `Task with ID "${nonExistentId}" not found`,
          );
        });
    });

    it('should return 404 when id is not found', () => {
      const updateData = {
        title: 'Invalid ID',
        description: 'Should fail validation',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .put('/tasks/invalid-id')
        .send(updateData)
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toContain(
            'Task with ID "invalid-id" not found',
          );
        });
    });

    it('should update task even with invalid status', () => {
      const updateData = {
        status: 'INVALID_STATUS',
      };

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send(updateData)
        .expect(200);
    });

    it('should update task even with empty title', () => {
      const updateData = {
        title: '',
      };

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send(updateData)
        .expect(200);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Task to Delete',
        description: 'This will be deleted',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);

      taskId = (response.body as Task).id;
    });

    it('should delete an existing task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(200);
    });

    it('should return 404 when trying to get deleted task', async () => {
      await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(200);

      return request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404);
    });

    it('should return 404 when task does not exist', () => {
      const nonExistentId = 'non-existent-uuid';
      return request(app.getHttpServer())
        .delete(`/tasks/${nonExistentId}`)
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toContain(
            `Task with ID "${nonExistentId}" not found`,
          );
        });
    });

    it('should return 404 when id is not found', () => {
      return request(app.getHttpServer())
        .delete('/tasks/invalid-id')
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toContain(
            'Task with ID "invalid-id" not found',
          );
        });
    });
  });

  describe('Multiple operations integration', () => {
    it('should handle creating, updating, and deleting multiple tasks', async () => {
      // Create multiple tasks
      const task1Data = {
        title: 'First Task',
        description: 'First Description',
        status: TaskStatus.TODO,
        userId: hardcodedUserId,
      };
      const task2Data = {
        title: 'Second Task',
        description: 'Second Description',
        status: TaskStatus.IN_PROGRESS,
        userId: hardcodedUserId,
      };

      const task1Response = await request(app.getHttpServer())
        .post('/tasks')
        .send(task1Data)
        .expect(201);

      const task2Response = await request(app.getHttpServer())
        .post('/tasks')
        .send(task2Data)
        .expect(201);

      const task1Id = (task1Response.body as Task).id;
      const task2Id = (task2Response.body as Task).id;

      // Verify both tasks exist
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          expect(res.body as Task[]).toHaveLength(2);
        });

      // Update first task
      await request(app.getHttpServer())
        .put(`/tasks/${task1Id}`)
        .send({ status: TaskStatus.DONE })
        .expect(200);

      // Delete second task
      await request(app.getHttpServer())
        .delete(`/tasks/${task2Id}`)
        .expect(200);

      // Verify only one task remains and it's updated
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          const tasks = res.body as Task[];
          expect(tasks).toHaveLength(1);
          expect(tasks[0].id).toBe(task1Id);
          expect(tasks[0].status).toBe(TaskStatus.DONE);
        });
    });
  });
});
