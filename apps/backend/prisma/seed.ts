import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'COACH';
  staffType: 'ADMINISTRATIVO' | 'DIRECTOR_TECNICO';
  squad?: string;
};

const USERS: SeedUser[] = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@svc.local',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Administrador SVC',
    role: 'ADMIN',
    staffType: 'ADMINISTRATIVO',
  },
  {
    email: 'dt.plantelA@svc.local',
    password: 'dt123456',
    name: 'DT Plantel A',
    role: 'COACH',
    staffType: 'DIRECTOR_TECNICO',
    squad: 'Masculino A',
  },
  {
    email: 'dt.plantelB@svc.local',
    password: 'dt123456',
    name: 'DT Plantel B',
    role: 'COACH',
    staffType: 'DIRECTOR_TECNICO',
    squad: 'Masculino B',
  },
  {
    email: 'dt.femenino@svc.local',
    password: 'dt123456',
    name: 'DT Plantel Femenino',
    role: 'COACH',
    staffType: 'DIRECTOR_TECNICO',
    squad: 'Femenino',
  },
];

async function seedUsers() {
  let created = 0;
  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`- Obviado (ya existe): ${u.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        name: u.name,
        role: u.role,
        staffType: u.staffType,
        squad: u.squad ?? null,
      },
    });
    created++;
    console.log(`+ Creado: ${u.email} (${u.role}/${u.staffType}${u.squad ? ` - ${u.squad}` : ''})`);
  }
  return created;
}

async function main() {
  console.log('Iniciando seed de usuarios...');
  const created = await seedUsers();
  console.log(`Seed finalizado. Usuarios creados: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
