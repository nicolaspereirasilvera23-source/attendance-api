import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findByCode(code: string) {
    const player = await this.prisma.player.findUnique({
      where: { code },
    });
    if (!player) {
      throw new NotFoundException('Código no encontrado');
    }
    return { existe: true, nombre: player.name };
  }

  async create(data: { name: string; age: number; timeInClub: number }) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    return this.prisma.player.create({
      data: {
        code,
        name: data.name,
        age: data.age,
        timeInClub: data.timeInClub,
      },
    });
  }

  async findAll() {
    return this.prisma.player.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return player;
  }

  async update(
    id: string,
    data: {
      name?: string;
      age?: number;
      timeInClub?: number;
      active?: boolean;
    },
  ) {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.player.update({
      where: { id },
      data: { active: false },
    });
  }
}
