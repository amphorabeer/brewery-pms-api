import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PackagingService } from './packaging.service';
import { CreatePackageFormatDto } from './dto/create-package-format.dto';
import { CreatePackagingOperationDto } from './dto/create-packaging-operation.dto';

@Controller('packaging')
@UseGuards(JwtAuthGuard)
export class PackagingController {
  constructor(private packagingService: PackagingService) {}

  // ==========================================
  // PACKAGE FORMATS
  // ==========================================

  @Post('formats')
  createPackageFormat(@Request() req, @Body() dto: CreatePackageFormatDto) {
    return this.packagingService.createPackageFormat(req.user.orgId, dto);
  }

  @Get('formats')
  getPackageFormats(
    @Request() req,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.packagingService.getPackageFormats(
      req.user.orgId,
      activeOnly !== 'false',
    );
  }

  @Get('formats/:id')
  getPackageFormatById(@Request() req, @Param('id') id: string) {
    return this.packagingService.getPackageFormatById(id, req.user.orgId);
  }

  @Patch('formats/:id')
  updatePackageFormat(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePackageFormatDto>,
  ) {
    return this.packagingService.updatePackageFormat(id, req.user.orgId, dto);
  }

  @Delete('formats/:id')
  deletePackageFormat(@Request() req, @Param('id') id: string) {
    return this.packagingService.deletePackageFormat(id, req.user.orgId);
  }

  // ==========================================
  // PACKAGING OPERATIONS
  // ==========================================

  @Post('operations')
  createPackagingOperation(
    @Request() req,
    @Body() dto: CreatePackagingOperationDto,
  ) {
    return this.packagingService.createPackagingOperation(
      req.user.userId,
      req.user.orgId,
      dto,
    );
  }

  @Get('operations')
  getPackagingOperations(
    @Request() req,
    @Query('batchId') batchId?: string,
  ) {
    return this.packagingService.getPackagingOperations(
      req.user.orgId,
      batchId,
    );
  }

  @Get('operations/:id')
  getPackagingOperationById(@Request() req, @Param('id') id: string) {
    return this.packagingService.getPackagingOperationById(id, req.user.orgId);
  }

  @Patch('operations/:id')
  updatePackagingOperation(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePackagingOperationDto>,
  ) {
    return this.packagingService.updatePackagingOperation(
      id,
      req.user.orgId,
      dto,
    );
  }

  @Delete('operations/:id')
  deletePackagingOperation(@Request() req, @Param('id') id: string) {
    return this.packagingService.deletePackagingOperation(id, req.user.orgId);
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  @Get('stats')
  getPackagingStats(
    @Request() req,
    @Query('batchId') batchId?: string,
  ) {
    return this.packagingService.getPackagingStats(req.user.orgId, batchId);
  }
}
