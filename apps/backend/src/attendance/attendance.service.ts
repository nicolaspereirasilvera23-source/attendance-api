import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(codigo: string) {
    const player = await this.prisma.player.findUnique({
      where: { code: codigo },
    });
    if (!player) {
      throw new NotFoundException('Código no encontrado');
    }
    if (!player.active) {
      throw new NotFoundException('Jugador inactivo');
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        playerId: player.id,
      },
      include: {
        player: true,
      },
    });

    return {
      nombre: attendance.player.name,
    };
  }

  async getRecentAttendances(limit = 10) {
    const attendances = await this.prisma.attendance.findMany({
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        player: true,
      },
    });

    return attendances.map((a) => ({
      nombre: a.player.name,
      codigo: a.player.code,
      hora: a.date.toISOString(),
    }));
  }

  async getWeeklyMetrics() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      include: {
        player: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by day
    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
    }

    for (const att of attendances) {
      const dateStr = att.date.toISOString().split('T')[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    }

    const dailyArray = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    // Group by player
    const playerAttendance: Record<
      string,
      { name: string; count: number; codes: string[] }
    > = {};
    for (const att of attendances) {
      const pid = att.player.id;
      if (!playerAttendance[pid]) {
        playerAttendance[pid] = { name: att.player.name, count: 0, codes: [] };
      }
      playerAttendance[pid].count++;
      if (!playerAttendance[pid].codes.includes(att.player.code)) {
        playerAttendance[pid].codes.push(att.player.code);
      }
    }

    const topPlayers = Object.values(playerAttendance)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((p) => ({
        nombre: p.name,
        codigo: p.codes[0],
        asistencias: p.count,
      }));

    return {
      total_semana: attendances.length,
      por_dia: dailyArray,
      top_jugadores: topPlayers,
    };
  }

  async batchSync(attendances: { codigo: string; timestamp: string }[]) {
    const results = [];
    for (const att of attendances) {
      try {
        const player = await this.prisma.player.findUnique({
          where: { code: att.codigo },
        });
        if (player && player.active) {
          const existing = await this.prisma.attendance.findFirst({
            where: {
              playerId: player.id,
              date: new Date(att.timestamp),
            },
          });
          if (!existing) {
            await this.prisma.attendance.create({
              data: {
                playerId: player.id,
                date: new Date(att.timestamp),
              },
            });
          }
          results.push({ codigo: att.codigo, success: true });
        } else {
          results.push({
            codigo: att.codigo,
            success: false,
            error: 'Jugador no encontrado o inactivo',
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Error desconocido';
        results.push({
          codigo: att.codigo,
          success: false,
          error: message,
        });
      }
    }
    return results;
  }
}
