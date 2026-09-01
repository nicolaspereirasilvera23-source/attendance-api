import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async findAll(startDate?: string, endDate?: string) {
    const where: { startDate?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }
    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  async findUpcoming(days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.prisma.event.findMany({
      where: {
        startDate: {
          gte: now,
          lte: future,
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }
    return event;
  }

  async create(data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    category?: string;
  }) {
    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location,
        category: data.category || 'MATCH',
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
      category?: string;
    },
    userRole: string,
  ) {
    if (userRole !== 'ADMIN' && userRole !== 'COACH') {
      throw new ForbiddenException('No tienes permiso para editar eventos');
    }

    await this.findOne(id);

    return this.prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        location: data.location,
        category: data.category,
      },
    });
  }

  async remove(id: string, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar eventos',
      );
    }

    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
