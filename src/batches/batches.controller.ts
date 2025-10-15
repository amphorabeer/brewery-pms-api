import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BatchStatus } from '@prisma/client';

@ApiTags('batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new batch' })
  create(@Request() req, @Body() createBatchDto: CreateBatchDto) {
    return this.batchesService.create(req.user.userId, createBatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all batches' })
  @ApiQuery({ name: 'status', required: false, enum: BatchStatus })
  findAll(@Request() req, @Query('status') status?: string) {
    return this.batchesService.findAll(req.user.orgId, status as BatchStatus);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get batch statistics' })
  getStatistics(@Request() req) {
    return this.batchesService.getStatistics(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch by ID' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.batchesService.findOne(id, req.user.orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update batch' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchesService.update(id, req.user.orgId, updateBatchDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete batch' })
  remove(@Request() req, @Param('id') id: string) {
    return this.batchesService.remove(id, req.user.orgId);
  }

  @Post(':id/fermentation-logs')
  @ApiOperation({ summary: 'Add fermentation log to batch' })
  addFermentationLog(
    @Request() req,
    @Param('id') id: string,
    @Body() createLogDto: any,
  ) {
    // This functionality needs to be moved to fermentation-logs module
    // For now, return not implemented
    return { message: 'Use /fermentation-logs endpoint instead' };
  }

  @Get(':id/fermentation-logs')
  @ApiOperation({ summary: 'Get fermentation logs for batch' })
  getFermentationLogs(@Request() req, @Param('id') id: string) {
    // This functionality needs to be moved to fermentation-logs module
    // For now, return empty array
    return [];
  }
}