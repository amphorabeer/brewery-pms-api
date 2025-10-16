import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: {
        ...createIngredientDto,
        orgId,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.ingredient.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const ingredient = await this.prisma.ingredient.findFirst({
      where: { id, orgId },
      include: {
        recipeIngredients: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    return ingredient;
  }

  async update(id: string, orgId: string, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.findOne(id, orgId);

    return this.prisma.ingredient.update({
      where: { id: ingredient.id },
      data: updateIngredientDto,
    });
  }

  async remove(id: string, orgId: string) {
    const ingredient = await this.findOne(id, orgId);

    return this.prisma.ingredient.delete({
      where: { id: ingredient.id },
    });
  }

  async findByType(orgId: string, type: string) {
    return this.prisma.ingredient.findMany({
      where: { orgId, type },
      orderBy: { name: 'asc' },
    });
  }
}