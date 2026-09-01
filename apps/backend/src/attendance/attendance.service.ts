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
