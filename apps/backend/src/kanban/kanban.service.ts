import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KanbanService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    return this.prisma.task.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findByStatus(status: string, userId?: string) {
    return this.prisma.task.findMany({
      where: { status, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }
    return task;
  }

  async create(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    userId?: string;
  }) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: 'TODO',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: data.userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      userId?: string | null;
    },
    userId: string,
    userRole: string,
  ) {
    const task = await this.findOne(id);

    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta tarea');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate
          ? new Date(data.dueDate)
          : data.dueDate === ''
            ? null
            : undefined,
        userId: data.userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateStatus(
    id: string,
    status: string,
    userId: string,
    userRole: string,
  ) {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    if (!validStatuses.includes(status)) {
      throw new ForbiddenException('Estado inválido');
    }

    const task = await this.findOne(id);

    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para cambiar el estado de esta tarea',
      );
    }

    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const task = await this.findOne(id);

    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta tarea',
      );
    }

    return this.prisma.task.delete({ where: { id } });
  }
}
