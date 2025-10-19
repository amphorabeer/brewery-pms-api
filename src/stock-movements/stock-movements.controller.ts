import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
    Query,
  } from '@nestjs/common';
  import { StockMovementsService } from './stock-movements.service';
  import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { MovementType } from '@prisma/client';
  
  @Controller('stock-movements')
  @UseGuards(JwtAuthGuard)
  export class StockMovementsController {
    constructor(private readonly stockMovementsService: StockMovementsService) {}
  
    @Post()
    create(@Req() req: any, @Body() createDto: CreateStockMovementDto) {
      return this.stockMovementsService.create(req.user.orgId, req.user.sub, createDto);
    }
  
    @Get()
    findAll(
      @Req() req: any,
      @Query('ingredientId') ingredientId?: string,
      @Query('type') type?: MovementType,
      @Query('search') search?: string,
    ) {
      return this.stockMovementsService.findAll(req.user.orgId, ingredientId, type, search);
    }
  
    @Get('stats')
    getStats(@Req() req: any) {
      return this.stockMovementsService.getStats(req.user.orgId);
    }
  
    @Get('recent')
    getRecent(@Req() req: any, @Query('days') days?: string) {
      return this.stockMovementsService.getRecent(
        req.user.orgId,
        days ? parseInt(days) : 30,
      );
    }
  
    @Get('ingredient/:ingredientId')
    findByIngredient(@Param('ingredientId') ingredientId: string, @Req() req: any) {
      return this.stockMovementsService.findByIngredient(ingredientId, req.user.orgId);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: any) {
      return this.stockMovementsService.findOne(id, req.user.orgId);
    }
  }