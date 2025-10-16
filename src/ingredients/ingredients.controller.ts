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
  import { IngredientsService } from './ingredients.service';
  import { CreateIngredientDto } from './dto/create-ingredient.dto';
  import { UpdateIngredientDto } from './dto/update-ingredient.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('ingredients')
  @UseGuards(JwtAuthGuard)
  export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) {}
  
    @Post()
    create(@Request() req, @Body() createIngredientDto: CreateIngredientDto) {
      return this.ingredientsService.create(req.user.orgId, createIngredientDto);
    }
  
    @Get()
    findAll(@Request() req, @Query('type') type?: string) {
      if (type) {
        return this.ingredientsService.findByType(req.user.orgId, type);
      }
      return this.ingredientsService.findAll(req.user.orgId);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
      return this.ingredientsService.findOne(id, req.user.orgId);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Request() req,
      @Body() updateIngredientDto: UpdateIngredientDto,
    ) {
      return this.ingredientsService.update(id, req.user.orgId, updateIngredientDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
      return this.ingredientsService.remove(id, req.user.orgId);
    }
  }