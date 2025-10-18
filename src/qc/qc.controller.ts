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
  import { QcService } from './qc.service';
  import { CreateQcTestTypeDto } from './dto/create-qc-test-type.dto';
  import { UpdateQcTestTypeDto } from './dto/update-qc-test-type.dto';
  import { CreateQcTestDto } from './dto/create-qc-test.dto';
  import { UpdateQcTestDto } from './dto/update-qc-test.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('qc')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('qc')
  export class QcController {
    constructor(private readonly qcService: QcService) {}
  
    // ========================================
    // QC TEST TYPES ENDPOINTS
    // ========================================
  
    @Post('test-types')
    @ApiOperation({ summary: 'Create QC test type' })
    createTestType(@Request() req, @Body() dto: CreateQcTestTypeDto) {
      return this.qcService.createTestType(req.user.orgId, dto);
    }
  
    @Get('test-types')
    @ApiOperation({ summary: 'Get all QC test types' })
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
    findAllTestTypes(
      @Request() req,
      @Query('activeOnly') activeOnly?: string,
    ) {
      const active = activeOnly === 'false' ? false : true;
      return this.qcService.findAllTestTypes(req.user.orgId, active);
    }
  
    @Get('test-types/:id')
    @ApiOperation({ summary: 'Get QC test type by ID' })
    findOneTestType(@Request() req, @Param('id') id: string) {
      return this.qcService.findOneTestType(id, req.user.orgId);
    }
  
    @Patch('test-types/:id')
    @ApiOperation({ summary: 'Update QC test type' })
    updateTestType(
      @Request() req,
      @Param('id') id: string,
      @Body() dto: UpdateQcTestTypeDto,
    ) {
      return this.qcService.updateTestType(id, req.user.orgId, dto);
    }
  
    @Delete('test-types/:id')
    @ApiOperation({ summary: 'Delete QC test type' })
    removeTestType(@Request() req, @Param('id') id: string) {
      return this.qcService.removeTestType(id, req.user.orgId);
    }
  
    // ========================================
    // QC TESTS ENDPOINTS
    // ========================================
  
    @Post('tests')
    @ApiOperation({ summary: 'Create QC test' })
    createTest(@Request() req, @Body() dto: CreateQcTestDto) {
      return this.qcService.createTest(
        req.user.userId,
        req.user.orgId,
        dto,
      );
    }
  
    @Get('tests')
    @ApiOperation({ summary: 'Get all QC tests' })
    @ApiQuery({ name: 'batchId', required: false })
    findAllTests(@Request() req, @Query('batchId') batchId?: string) {
      return this.qcService.findAllTests(req.user.orgId, batchId);
    }
  
    @Get('tests/:id')
    @ApiOperation({ summary: 'Get QC test by ID' })
    findOneTest(@Request() req, @Param('id') id: string) {
      return this.qcService.findOneTest(id, req.user.orgId);
    }
  
    @Patch('tests/:id')
    @ApiOperation({ summary: 'Update QC test' })
    updateTest(
      @Request() req,
      @Param('id') id: string,
      @Body() dto: UpdateQcTestDto,
    ) {
      return this.qcService.updateTest(id, req.user.orgId, dto);
    }
  
    @Delete('tests/:id')
    @ApiOperation({ summary: 'Delete QC test' })
    removeTest(@Request() req, @Param('id') id: string) {
      return this.qcService.removeTest(id, req.user.orgId);
    }
  
    // ========================================
    // STATISTICS
    // ========================================
  
    @Get('stats')
    @ApiOperation({ summary: 'Get QC test statistics' })
    @ApiQuery({ name: 'batchId', required: false })
    getStats(@Request() req, @Query('batchId') batchId?: string) {
      return this.qcService.getTestStats(req.user.orgId, batchId);
    }
  }