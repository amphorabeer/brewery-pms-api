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
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { SuppliersService } from './suppliers.service';
  import { CreateSupplierDto } from './dto/create-supplier.dto';
  
  @Controller('suppliers')
  @UseGuards(JwtAuthGuard)
  export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) {}
  
    @Post()
    create(@Request() req, @Body() createSupplierDto: CreateSupplierDto) {
      return this.suppliersService.create(req.user.orgId, createSupplierDto);
    }
  
    @Get()
    findAll(@Request() req, @Query('activeOnly') activeOnly?: string) {
      return this.suppliersService.findAll(req.user.orgId, activeOnly !== 'false');
    }
  
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.suppliersService.findOne(id, req.user.orgId);
    }
  
    @Patch(':id')
    update(
      @Request() req,
      @Param('id') id: string,
      @Body() updateSupplierDto: Partial<CreateSupplierDto>,
    ) {
      return this.suppliersService.update(id, req.user.orgId, updateSupplierDto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.suppliersService.remove(id, req.user.orgId);
    }
  }