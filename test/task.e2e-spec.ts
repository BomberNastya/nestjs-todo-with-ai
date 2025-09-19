import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TaskStatus } from '../src/task/task-status.enum';

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
      };
      const task2 = {
        title: 'Task 2',
        description: 'Description 2',
        status: TaskStatus.IN_PROGRESS,
      };

      await request(app.getHttpServer()).post('/tasks').send(task1).expect(201);

      await request(app.getHttpServer()).post('/tasks').send(task2).expect(201);

      // Then get all tasks
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toMatchObject({
            ...task1,
            userId: hardcodedUserId,
          });
          expect(res.body[1]).toMatchObject({
            ...task2,
            userId: hardcodedUserId,
          });
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[1]).toHaveProperty('id');
        });
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a specific task by id', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);

      const taskId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            ...taskData,
            id: taskId,
            userId: hardcodedUserId,
          });
        });
    });

    it('should return 404 when task does not exist', () => {
      return request(app.getHttpServer())
        .get('/tasks/999999')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Task with ID 999999 not found');
        });
    });

    it('should return 400 when id is not a valid number', () => {
      return request(app.getHttpServer())
        .get('/tasks/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
        });
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task with valid data', () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            ...taskData,
            userId: hardcodedUserId,
          });
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
        });
    });

    it('should create a task with IN_PROGRESS status', () => {
      const taskData = {
        title: 'In Progress Task',
        description: 'Currently working on this',
        status: TaskStatus.IN_PROGRESS,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
        });
    });

    it('should create a task with DONE status', () => {
      const taskData = {
        title: 'Completed Task',
        description: 'This task is finished',
        status: TaskStatus.DONE,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(TaskStatus.DONE);
        });
    });

    it('should return 400 when title is missing', () => {
      const taskData = {
        description: 'Missing title',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('title');
        });
    });

    it('should return 400 when title is empty string', () => {
      const taskData = {
        title: '',
        description: 'Empty title',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('title');
        });
    });

    it('should return 400 when description is missing', () => {
      const taskData = {
        title: 'Missing description',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('description');
        });
    });

    it('should return 400 when status is invalid', () => {
      const taskData = {
        title: 'Invalid status',
        description: 'Testing invalid status',
        status: 'INVALID_STATUS',
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('status');
        });
    });

    it('should return 400 when status is missing', () => {
      const taskData = {
        title: 'Missing status',
        description: 'No status provided',
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('status');
        });
    });
  });

  describe('PUT /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const taskData = {
        title: 'Original Task',
        description: 'Original Description',
        status: TaskStatus.TODO,
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);

      taskId = response.body.id;
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
          expect(res.body).toMatchObject({
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
          expect(res.body.title).toBe('Only Title Updated');
          expect(res.body.description).toBe('Original Description');
          expect(res.body.status).toBe(TaskStatus.TODO);
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
          expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
          expect(res.body.title).toBe('Original Task');
          expect(res.body.description).toBe('Original Description');
        });
    });

    it('should return 404 when task does not exist', () => {
      const updateData = {
        title: 'Non-existent task',
        description: 'This should fail',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .put('/tasks/999999')
        .send(updateData)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Task with ID 999999 not found');
        });
    });

    it('should return 400 when id is not a valid number', () => {
      const updateData = {
        title: 'Invalid ID',
        description: 'Should fail validation',
        status: TaskStatus.TODO,
      };

      return request(app.getHttpServer())
        .put('/tasks/invalid-id')
        .send(updateData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
        });
    });

    it('should return 400 when status is invalid', () => {
      const updateData = {
        status: 'INVALID_STATUS',
      };

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send(updateData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('status');
        });
    });

    it('should return 400 when title is empty string', () => {
      const updateData = {
        title: '',
      };

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send(updateData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('title');
        });
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const taskData = {
        title: 'Task to Delete',
        description: 'This will be deleted',
        status: TaskStatus.TODO,
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(taskData)
        .expect(201);

      taskId = response.body.id;
    });

    it('should delete an existing task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain(
            `Task with ID ${taskId} deleted successfully`,
          );
        });
    });

    it('should return 404 when trying to get deleted task', async () => {
      await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(200);

      return request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404);
    });

    it('should return 404 when task does not exist', () => {
      return request(app.getHttpServer())
        .delete('/tasks/999999')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Task with ID 999999 not found');
        });
    });

    it('should return 400 when id is not a valid number', () => {
      return request(app.getHttpServer())
        .delete('/tasks/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
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
      };
      const task2Data = {
        title: 'Second Task',
        description: 'Second Description',
        status: TaskStatus.IN_PROGRESS,
      };

      const task1Response = await request(app.getHttpServer())
        .post('/tasks')
        .send(task1Data)
        .expect(201);

      const task2Response = await request(app.getHttpServer())
        .post('/tasks')
        .send(task2Data)
        .expect(201);

      const task1Id = task1Response.body.id;
      const task2Id = task2Response.body.id;

      // Verify both tasks exist
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
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
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toBe(task1Id);
          expect(res.body[0].status).toBe(TaskStatus.DONE);
        });
    });
  });
});
