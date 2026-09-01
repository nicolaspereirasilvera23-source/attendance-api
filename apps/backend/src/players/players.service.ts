import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  private validateCode(code: string) {
    if (!/^\d{4}$/.test(code)) {
      throw new BadRequestException(
        'El código debe ser de 4 dígitos numéricos',
      );
    }
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempts = 0; attempts < 10; attempts++) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const existing = await this.prisma.player.findUnique({ where: { code } });
      if (!existing) {
        return code;
      }
    }
    throw new ConflictException(
      'No se pudo generar un código único, intente nuevamente',
    );
  }

  async findByCode(code: string) {
    this.validateCode(code);
    const player = await this.prisma.player.findUnique({
      where: { code },
    });
    if (!player) {
      throw new NotFoundException('Código no encontrado');
    }
    return { existe: true, nombre: player.name };
  }

  async create(data: { name: string; age: number; timeInClub: number }) {
    const code = await this.generateUniqueCode();
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
