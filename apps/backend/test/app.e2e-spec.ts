import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let playerCode: string;
  let playerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.attendance.deleteMany({ where: { player: { code: { startsWith: 'TEST' } } } });
    await prisma.player.deleteMany({ where: { code: { startsWith: 'TEST' } } });
    await prisma.task.deleteMany({ where: { title: { startsWith: 'TEST' } } });
    await prisma.event.deleteMany({ where: { title: { startsWith: 'TEST' } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test' } } });

    await request(app.getHttpServer())
      .post('/api/auth/init-admin')
      .expect(200);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@svc.local', password: 'admin123' })
      .expect(200);

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /auth/login - should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@svc.local', password: 'admin123' })
        .expect(200)
        .expect(res => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.role).toBe('ADMIN');
        });
    });

    it('POST /auth/login - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@svc.local', password: 'wrong' })
        .expect(401);
    });

    it('GET /auth/profile - should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toBe('admin@svc.local');
        });
    });
  });

  describe('Players', () => {
    it('POST /jugadores - should create a new player with 4-digit code', () => {
      return request(app.getHttpServer())
        .post('/api/jugadores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Player', age: 20, timeInClub: 12 })
        .expect(201)
        .expect(res => {
          expect(res.body.code).toMatch(/^\d{4}$/);
          expect(res.body.name).toBe('Test Player');
          expect(res.body.active).toBe(true);
          playerCode = res.body.code;
          playerId = res.body.id;
        });
    });

    it('GET /jugadores/verificar/:codigo - should verify player exists', () => {
      return request(app.getHttpServer())
        .get(`/api/jugadores/verificar/${playerCode}`)
        .expect(200)
        .expect(res => {
          expect(res.body.existe).toBe(true);
          expect(res.body.nombre).toBe('Test Player');
        });
    });

    it('GET /jugadores/verificar/:codigo - should fail for non-existent code', () => {
      return request(app.getHttpServer())
        .get('/api/jugadores/verificar/9999')
        .expect(404);
    });

    it('GET /jugadores - should list all active players', () => {
      return request(app.getHttpServer())
        .get('/api/jugadores')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.some((p: any) => p.code === playerCode)).toBe(true);
        });
    });

    it('PUT /jugadores/:id - should update player', () => {
      return request(app.getHttpServer())
        .put(`/api/jugadores/${playerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ age: 21, timeInClub: 13 })
        .expect(200)
        .expect(res => {
          expect(res.body.age).toBe(21);
          expect(res.body.timeInClub).toBe(13);
        });
    });

    it('DELETE /jugadores/:id - should deactivate player', () => {
      return request(app.getHttpServer())
        .delete(`/api/jugadores/${playerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Attendance', () => {
    let activePlayerCode: string;
    let activePlayerId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/jugadores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Active Test Player', age: 25, timeInClub: 6 })
        .expect(201);
      activePlayerCode = res.body.code;
      activePlayerId = res.body.id;
    });

    it('POST /check-in - should register attendance', () => {
      return request(app.getHttpServer())
        .post('/api/check-in')
        .send({ codigo: activePlayerCode })
        .expect(200)
        .expect(res => {
          expect(res.body.nombre).toBe('Active Test Player');
        });
    });

    it('POST /check-in - should fail for inactive player', () => {
      return request(app.getHttpServer())
        .post('/api/check-in')
        .send({ codigo: playerCode })
        .expect(404);
    });

    it('POST /check-in - should fail for non-existent code', () => {
      return request(app.getHttpServer())
        .post('/api/check-in')
        .send({ codigo: '0000' })
        .expect(404);
    });

    it('GET /asistencias/recientes - should return recent attendances', () => {
      return request(app.getHttpServer())
        .get('/api/asistencias/recientes')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('GET /asistencias/semanales - should return weekly metrics', () => {
      return request(app.getHttpServer())
        .get('/api/asistencias/semanales')
        .expect(200)
        .expect(res => {
          expect(res.body.total_semana).toBeDefined();
          expect(Array.isArray(res.body.por_dia)).toBe(true);
          expect(res.body.por_dia.length).toBe(7);
          expect(Array.isArray(res.body.top_jugadores)).toBe(true);
        });
    });

    it('POST /check-in/batch-sync - should sync offline attendances', () => {
      return request(app.getHttpServer())
        .post('/api/check-in/batch-sync')
        .send({
          attendances: [
            { codigo: activePlayerCode, timestamp: new Date().toISOString() },
          ],
        })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].success).toBe(true);
        });
    });
  });

  describe('Stats', () => {
    it('GET /stats - should return metrics', () => {
      return request(app.getHttpServer())
        .get('/api/stats')
        .expect(200)
        .expect(res => {
          expect(res.body.total_jugadores).toBeDefined();
          expect(res.body.asistencias_hoy).toBeDefined();
        });
    });
  });

  describe('Kanban', () => {
    let taskId: string;

    it('POST /kanban - should create task', () => {
      return request(app.getHttpServer())
        .post('/api/kanban')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'TEST Task', description: 'Test description', priority: 'HIGH' })
        .expect(201)
        .expect(res => {
          expect(res.body.title).toBe('TEST Task');
          expect(res.body.status).toBe('TODO');
          taskId = res.body.id;
        });
    });

    it('GET /kanban - should list tasks', () => {
      return request(app.getHttpServer())
        .get('/api/kanban')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('PUT /kanban/:id/status - should update task status', () => {
      return request(app.getHttpServer())
        .put(`/api/kanban/${taskId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200)
        .expect(res => {
          expect(res.body.status).toBe('IN_PROGRESS');
        });
    });

    it('PUT /kanban/:id - should update task', () => {
      return request(app.getHttpServer())
        .put(`/api/kanban/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'TEST Updated', priority: 'URGENT' })
        .expect(200)
        .expect(res => {
          expect(res.body.title).toBe('TEST Updated');
          expect(res.body.priority).toBe('URGENT');
        });
    });

    it('DELETE /kanban/:id - should delete task', () => {
      return request(app.getHttpServer())
        .delete(`/api/kanban/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Calendar', () => {
    let eventId: string;

    it('POST /calendar - should create event (COACH)', () => {
      return request(app.getHttpServer())
        .post('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'TEST Match',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 90000000).toISOString(),
          location: 'Club',
          category: 'MATCH',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.title).toBe('TEST Match');
          eventId = res.body.id;
        });
    });

    it('GET /calendar - should list events', () => {
      return request(app.getHttpServer())
        .get('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /calendar/upcoming - should return upcoming events', () => {
      return request(app.getHttpServer())
        .get('/api/calendar/upcoming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('DELETE /calendar/:id - should delete event (ADMIN only)', () => {
      return request(app.getHttpServer())
        .delete(`/api/calendar/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});