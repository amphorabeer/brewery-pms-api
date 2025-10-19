import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stats')
  getStats(@Req() req: any) {
    return this.inventoryService.getStats(req.user.orgId);
  }

  @Get('stock-levels')
  getStockLevels(@Req() req: any) {
    return this.inventoryService.getStockLevels(req.user.orgId);
  }

  @Get('low-stock')
  getLowStock(@Req() req: any, @Query('threshold') threshold?: string) {
    return this.inventoryService.getLowStock(
      req.user.orgId,
      threshold ? parseInt(threshold) : 10,
    );
  }

  @Get('by-type')
  getStockByType(@Req() req: any) {
    return this.inventoryService.getStockByType(req.user.orgId);
  }

  @Get('movement-stats')
  getMovementStats(@Req() req: any, @Query('days') days?: string) {
    return this.inventoryService.getMovementStats(
      req.user.orgId,
      days ? parseInt(days) : 30,
    );
  }

  @Get('top-suppliers')
  getTopSuppliers(@Req() req: any, @Query('limit') limit?: string) {
    return this.inventoryService.getTopSuppliers(
      req.user.orgId,
      limit ? parseInt(limit) : 5,
    );
  }

  @Get('value')
  getInventoryValue(@Req() req: any) {
    return this.inventoryService.getInventoryValue(req.user.orgId);
  }

  @Get('consumption-trends')
  getConsumptionTrends(@Req() req: any) {
    return this.inventoryService.getConsumptionTrends(req.user.orgId);
  }
}