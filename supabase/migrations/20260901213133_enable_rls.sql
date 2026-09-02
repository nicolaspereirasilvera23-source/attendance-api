-- El backend NestJS accede via Prisma con el rol postgres (superusuario, ignora RLS).
-- Se habilita RLS en todas las tablas expuestas sin políticas: anon/authenticated (PostgREST)
-- quedan bloqueados, eliminando la exposicion de datos (incluida la columna email/password).
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;