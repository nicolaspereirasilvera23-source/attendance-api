import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(@Body() body: { codigo: string }) {
    return this.attendanceService.checkIn(body.codigo);
  }

  @Get('asistencias/recientes')
  async getRecentAttendances() {
    return this.attendanceService.getRecentAttendances();
  }

  @Post('check-in/batch-sync')
  @HttpCode(HttpStatus.OK)
  async batchSync(
    @Body() body: { attendances: { codigo: string; timestamp: string }[] },
  ) {
    return this.attendanceService.batchSync(body.attendances);
  }
}
