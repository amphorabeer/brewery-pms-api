import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Recipes')
@ApiBearerAuth()
@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new recipe' })
  @ApiResponse({ status: 201, description: 'Recipe created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@CurrentUser() user: any, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(user.userId, user.orgId, createRecipeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recipes' })
  @ApiResponse({ status: 200, description: 'Returns list of recipes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: any) {
    return this.recipesService.findAll(user.orgId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search recipes' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Returns filtered recipes' })
  search(
    @CurrentUser() user: any,
    @Query('search') search?: string,
  ) {
    return this.recipesService.search(user.orgId, search || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recipe by ID' })
  @ApiResponse({ status: 200, description: 'Returns recipe details' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.recipesService.findOne(id, user.orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update recipe' })
  @ApiResponse({ status: 200, description: 'Recipe updated successfully' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, user.orgId, updateRecipeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete recipe' })
  @ApiResponse({ status: 200, description: 'Recipe deleted successfully' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.recipesService.remove(id, user.orgId);
  }
}