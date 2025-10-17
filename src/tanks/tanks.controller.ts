import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TanksService } from './tanks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tanks')
@UseGuards(JwtAuthGuard)
export class TanksController {
  constructor(private tanksService: TanksService) {}

  @Get()
  async findAll(@Request() req) {
    return this.tanksService.findAll(req.user.orgId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.tanksService.findOne(req.user.orgId, id);
  }

  @Post()
  async create(@Request() req, @Body() createTankDto: any) {
    return this.tanksService.create(req.user.orgId, createTankDto);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTankDto: any,
  ) {
    return this.tanksService.update(req.user.orgId, id, updateTankDto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.tanksService.delete(req.user.orgId, id);
  }
}
