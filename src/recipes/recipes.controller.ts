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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { AddIngredientToRecipeDto } from './dto/add-ingredient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  create(@Request() req, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(
      req.user.userId,
      req.user.orgId,
      createRecipeDto,
    );
  }

  @Get()
  findAll(@Request() req, @Query('activeOnly') activeOnly?: string) {
    return this.recipesService.findAll(
      req.user.orgId,
      activeOnly === 'true',
    );
  }

  @Get('search')
  search(@Request() req, @Query('q') searchTerm: string) {
    return this.recipesService.search(req.user.orgId, searchTerm);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.recipesService.findOne(id, req.user.orgId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, req.user.orgId, updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.recipesService.remove(id, req.user.orgId);
  }

  // Recipe Ingredients Endpoints
  @Post(':id/ingredients')
  addIngredient(
    @Param('id') recipeId: string,
    @Request() req,
    @Body() dto: AddIngredientToRecipeDto,
  ) {
    return this.recipesService.addIngredient(recipeId, req.user.orgId, dto);
  }

  @Delete(':recipeId/ingredients/:ingredientId')
  removeIngredient(
    @Param('recipeId') recipeId: string,
    @Param('ingredientId') ingredientId: string,
    @Request() req,
  ) {
    return this.recipesService.removeIngredient(
      ingredientId,
      recipeId,
      req.user.orgId,
    );
  }
}