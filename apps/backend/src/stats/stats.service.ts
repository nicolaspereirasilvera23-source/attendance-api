import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPlayers, asistenciasHoy] = await Promise.all([
      this.prisma.player.count({ where: { active: true } }),
      this.prisma.attendance.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    return {
      total_jugadores: totalPlayers,
      asistencias_hoy: asistenciasHoy,
    };
  }
}
