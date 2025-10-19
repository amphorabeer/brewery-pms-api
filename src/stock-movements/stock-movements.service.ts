import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  // Create stock movement
  async create(orgId: string, userId: string, createDto: CreateStockMovementDto) {
    // Verify ingredient exists
    const ingredient = await this.prisma.ingredient.findFirst({
      where: { id: createDto.ingredientId, orgId },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    // Verify location if provided
    if (createDto.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: createDto.locationId, orgId },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }
    }

    // Verify batch if provided
    if (createDto.batchId) {
      const batch = await this.prisma.batch.findFirst({
        where: { id: createDto.batchId, orgId },
      });

      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
    }

    // Check if there's enough stock for OUT movements
    if (
      (createDto.type === MovementType.OUT ||
        createDto.type === MovementType.BREWING ||
        createDto.type === MovementType.SPOILAGE) &&
      ingredient.stock
    ) {
      if (Number(ingredient.stock) < createDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${ingredient.stock} ${createDto.unit}`,
        );
      }
    }

    // Create movement
    const movement = await this.prisma.stockMovement.create({
      data: {
        orgId,
        ingredientId: createDto.ingredientId,
        locationId: createDto.locationId,
        batchId: createDto.batchId,
        type: createDto.type,
        quantity: createDto.quantity,
        unit: createDto.unit,
        reason: createDto.reason,
        reference: createDto.reference,
        movedBy: userId,
        movedAt: createDto.movedAt ? new Date(createDto.movedAt) : new Date(),
      },
      include: {
        ingredient: true,
        location: true,
        batch: {
          select: {
            id: true,
            batchNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update ingredient stock
    let stockChange = 0;
    switch (createDto.type) {
      case MovementType.IN:
        stockChange = createDto.quantity;
        break;
      case MovementType.OUT:
      case MovementType.BREWING:
      case MovementType.SPOILAGE:
        stockChange = -createDto.quantity;
        break;
      case MovementType.ADJUSTMENT:
        // For adjustments, the quantity is the new total, not the change
        // We'll handle this separately
        break;
      case MovementType.TRANSFER:
        // Transfer doesn't change total stock
        stockChange = 0;
        break;
    }

    if (createDto.type !== MovementType.ADJUSTMENT) {
      await this.prisma.ingredient.update({
        where: { id: createDto.ingredientId },
        data: {
          stock: {
            increment: stockChange,
          },
        },
      });
    } else {
      // For adjustments, set the stock to the new value
      await this.prisma.ingredient.update({
        where: { id: createDto.ingredientId },
        data: {
          stock: createDto.quantity,
        },
      });
    }

    return movement;
  }

  // Get all stock movements
  async findAll(
    orgId: string,
    ingredientId?: string,
    type?: MovementType,
    search?: string,
  ) {
    const where: any = { orgId };

    if (ingredientId) {
      where.ingredientId = ingredientId;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { ingredient: { name: { contains: search, mode: 'insensitive' } } },
        { reference: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.stockMovement.findMany({
      where,
      orderBy: { movedAt: 'desc' },
      include: {
        ingredient: true,
        location: true,
        batch: {
          select: {
            id: true,
            batchNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 100, // Limit to last 100 movements
    });
  }

  // Get stock movement by ID
  async findOne(id: string, orgId: string) {
    const movement = await this.prisma.stockMovement.findFirst({
      where: { id, orgId },
      include: {
        ingredient: true,
        location: true,
        batch: {
          select: {
            id: true,
            batchNumber: true,
            recipe: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!movement) {
      throw new NotFoundException('Stock movement not found');
    }

    return movement;
  }

  // Get movements for specific ingredient
  async findByIngredient(ingredientId: string, orgId: string) {
    const ingredient = await this.prisma.ingredient.findFirst({
      where: { id: ingredientId, orgId },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    return this.prisma.stockMovement.findMany({
      where: { ingredientId, orgId },
      orderBy: { movedAt: 'desc' },
      include: {
        location: true,
        batch: {
          select: {
            batchNumber: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Get statistics
  async getStats(orgId: string) {
    const [total, byType] = await Promise.all([
      this.prisma.stockMovement.count({ where: { orgId } }),
      this.prisma.stockMovement.groupBy({
        by: ['type'],
        where: { orgId },
        _count: { type: true },
        _sum: { quantity: true },
      }),
    ]);

    const stats: any = {
      total,
      byType: {},
    };

    byType.forEach((item) => {
      stats.byType[item.type] = {
        count: item._count.type,
        totalQuantity: item._sum.quantity || 0,
      };
    });

    return stats;
  }

  // Get recent movements (last 30 days)
  async getRecent(orgId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.stockMovement.findMany({
      where: {
        orgId,
        movedAt: { gte: startDate },
      },
      orderBy: { movedAt: 'desc' },
      include: {
        ingredient: true,
        location: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 50,
    });
  }
}