import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { AddIngredientToRecipeDto } from './dto/add-ingredient.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, orgId: string, dto: CreateRecipeDto) {
    const recipe = await this.prisma.recipe.create({
      data: {
        orgId,
        name: dto.name,
        style: dto.style,
        batchSize: dto.batchSize,
        abv: dto.abv,
        ibu: dto.ibu,
        og: dto.og,
        fg: dto.fg,
        mashTemp: dto.mashTemp,
        mashTime: dto.mashTime,
        boilTime: dto.boilTime,
        fermentTemp: dto.fermentTemp,
        fermentDays: dto.fermentDays,
        notes: dto.notes,
        isActive: dto.isActive ?? true,
      },
    });

    return recipe;
  }

  async findAll(orgId: string, activeOnly: boolean = false) {
    const recipes = await this.prisma.recipe.findMany({
      where: {
        orgId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            batches: true,
          },
        },
      },
    });

    return recipes;
  }

  async findOne(id: string, orgId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        batches: {
          take: 5,
          orderBy: { brewDate: 'desc' },
        },
        _count: {
          select: {
            batches: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.orgId !== orgId) {
      throw new ForbiddenException('Access denied to this recipe');
    }

    return recipe;
  }

  async update(id: string, orgId: string, dto: UpdateRecipeDto) {
    const existing = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Recipe not found');
    }

    if (existing.orgId !== orgId) {
      throw new ForbiddenException('Access denied to this recipe');
    }

    const updated = await this.prisma.recipe.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.style && { style: dto.style }),
        ...(dto.batchSize && { batchSize: dto.batchSize }),
        ...(dto.abv !== undefined && { abv: dto.abv }),
        ...(dto.ibu !== undefined && { ibu: dto.ibu }),
        ...(dto.og !== undefined && { og: dto.og }),
        ...(dto.fg !== undefined && { fg: dto.fg }),
        ...(dto.mashTemp !== undefined && { mashTemp: dto.mashTemp }),
        ...(dto.mashTime !== undefined && { mashTime: dto.mashTime }),
        ...(dto.boilTime !== undefined && { boilTime: dto.boilTime }),
        ...(dto.fermentTemp !== undefined && { fermentTemp: dto.fermentTemp }),
        ...(dto.fermentDays !== undefined && { fermentDays: dto.fermentDays }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return updated;
  }

  async remove(id: string, orgId: string) {
    const existing = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Recipe not found');
    }

    if (existing.orgId !== orgId) {
      throw new ForbiddenException('Access denied to this recipe');
    }

    if (existing._count.batches > 0) {
      const updated = await this.prisma.recipe.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        message: 'Recipe deactivated (has existing batches)',
        recipe: updated,
      };
    }

    await this.prisma.recipe.delete({
      where: { id },
    });

    return { message: 'Recipe deleted successfully' };
  }

  async search(orgId: string, searchTerm: string) {
    const recipes = await this.prisma.recipe.findMany({
      where: {
        orgId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { style: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes;
  }

  // Recipe Ingredients Management
  async addIngredient(
    recipeId: string,
    orgId: string,
    dto: AddIngredientToRecipeDto,
  ) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe || recipe.orgId !== orgId) {
      throw new NotFoundException('Recipe not found');
    }

    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: dto.ingredientId },
    });

    if (!ingredient || ingredient.orgId !== orgId) {
      throw new NotFoundException('Ingredient not found');
    }

    const recipeIngredient = await this.prisma.recipeIngredient.create({
      data: {
        recipeId,
        ingredientId: dto.ingredientId,
        quantity: dto.quantity,
        unit: dto.unit,
        timing: dto.timing,
        notes: dto.notes,
      },
      include: {
        ingredient: true,
      },
    });

    return recipeIngredient;
  }

  async removeIngredient(
    recipeIngredientId: string,
    recipeId: string,
    orgId: string,
  ) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe || recipe.orgId !== orgId) {
      throw new NotFoundException('Recipe not found');
    }

    await this.prisma.recipeIngredient.delete({
      where: { id: recipeIngredientId },
    });

    return { message: 'Ingredient removed from recipe' };
  }
}