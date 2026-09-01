import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('jugadores')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('verificar/:codigo')
  async verify(@Param('codigo') codigo: string) {
    return this.playersService.findByCode(codigo);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: { name: string; age: number; timeInClub: number },
  ) {
    return this.playersService.create(body);
  }

  @Get()
  async findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      age?: number;
      timeInClub?: number;
      active?: boolean;
    },
  ) {
    return this.playersService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
