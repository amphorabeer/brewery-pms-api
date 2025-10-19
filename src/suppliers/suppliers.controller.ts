import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@Req() req: any, @Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(req.user.orgId, createSupplierDto);
  }

  @Get()
  findAll(@Req() req: any, @Query('search') search?: string) {
    return this.suppliersService.findAll(req.user.orgId, search);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.suppliersService.getStats(req.user.orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.findOne(id, req.user.orgId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, req.user.orgId, updateSupplierDto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.toggleActive(id, req.user.orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.remove(id, req.user.orgId);
  }
}