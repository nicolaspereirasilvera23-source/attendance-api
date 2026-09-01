import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@Controller('kanban')
@UseGuards(JwtAuthGuard)
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get()
  async findAll(@Request() req: AuthRequest, @Query('status') status?: string) {
    if (status) {
      return this.kanbanService.findByStatus(status, req.user.id);
    }
    return this.kanbanService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.kanbanService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body()
    body: {
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      userId?: string;
    },
    @Request() req: AuthRequest,
  ) {
    return this.kanbanService.create({
      ...body,
      userId: body.userId || req.user.id,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      userId?: string | null;
    },
    @Request() req: AuthRequest,
  ) {
    return this.kanbanService.update(id, body, req.user.id, req.user.role);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: AuthRequest,
  ) {
    return this.kanbanService.updateStatus(
      id,
      body.status,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.kanbanService.remove(id, req.user.id, req.user.role);
  }
}
