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
  import { PurchaseOrdersService } from './purchase-orders.service';
  import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
  import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { PurchaseOrderStatus } from '@prisma/client';
  
  @Controller('purchase-orders')
  @UseGuards(JwtAuthGuard)
  export class PurchaseOrdersController {
    constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}
  
    @Post()
    create(@Req() req: any, @Body() createDto: CreatePurchaseOrderDto) {
      return this.purchaseOrdersService.create(req.user.orgId, req.user.sub, createDto);
    }
  
    @Get()
    findAll(
      @Req() req: any,
      @Query('search') search?: string,
      @Query('status') status?: PurchaseOrderStatus,
    ) {
      return this.purchaseOrdersService.findAll(req.user.orgId, search, status);
    }
  
    @Get('stats')
    getStats(@Req() req: any) {
      return this.purchaseOrdersService.getStats(req.user.orgId);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: any) {
      return this.purchaseOrdersService.findOne(id, req.user.orgId);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Req() req: any,
      @Body() updateDto: UpdatePurchaseOrderDto,
    ) {
      return this.purchaseOrdersService.update(id, req.user.orgId, updateDto);
    }
  
    @Post(':id/receive')
    receive(
      @Param('id') id: string,
      @Req() req: any,
      @Body('locationId') locationId?: string,
    ) {
      return this.purchaseOrdersService.receive(id, req.user.orgId, req.user.sub, locationId);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
      return this.purchaseOrdersService.remove(id, req.user.orgId);
    }
  }