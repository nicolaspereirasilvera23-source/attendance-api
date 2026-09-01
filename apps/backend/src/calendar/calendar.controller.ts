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
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.calendarService.findAll(startDate, endDate);
  }

  @Get('upcoming')
  async findUpcoming(@Query('days') days?: string) {
    return this.calendarService.findUpcoming(days ? parseInt(days, 10) : 7);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body()
    body: {
      title: string;
      description?: string;
      startDate: string;
      endDate: string;
      location?: string;
      category?: string;
    },
  ) {
    return this.calendarService.create(body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
      category?: string;
    },
    @Request() req: AuthRequest,
  ) {
    return this.calendarService.update(id, body, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.calendarService.remove(id, req.user.role);
  }
}
