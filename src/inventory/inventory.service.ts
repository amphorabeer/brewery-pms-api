import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Get inventory dashboard statistics
  async getStats(orgId: string) {
    const [
      totalIngredients,
      activeIngredients,
      lowStock,
      outOfStock,
      totalValue,
      recentMovements,
    ] = await Promise.all([
      // Total ingredients
      this.prisma.ingredient.count({ where: { orgId } }),

      // Active ingredients
      this.prisma.ingredient.count({ where: { orgId, isActive: true } }),

      // Low stock (less than 10 units or null)
      this.prisma.ingredient.count({
        where: {
          orgId,
          isActive: true,
          OR: [{ stock: { lt: 10 } }, { stock: null }],
        },
      }),

      // Out of stock
      this.prisma.ingredient.count({
        where: {
          orgId,
          isActive: true,
          OR: [{ stock: 0 }, { stock: null }],
        },
      }),

      // Total inventory value
      this.prisma.ingredient.aggregate({
        where: { orgId, isActive: true },
        _sum: {
          stock: true,
        },
      }),

      // Recent movements count (last 7 days)
      this.prisma.stockMovement.count({
        where: {
          orgId,
          movedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalIngredients,
      activeIngredients,
      lowStock,
      outOfStock,
      totalStock: totalValue._sum.stock || 0,
      recentMovements,
    };
  }

  // Get stock levels for all ingredients
  async getStockLevels(orgId: string) {
    const ingredients = await this.prisma.ingredient.findMany({
      where: { orgId, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        unit: true,
        stock: true,
        costPerUnit: true,
      },
      orderBy: { name: 'asc' },
    });

    return ingredients.map((ingredient) => ({
      ...ingredient,
      stock: ingredient.stock || 0,
      value: ingredient.stock && ingredient.costPerUnit 
        ? Number(ingredient.stock) * Number(ingredient.costPerUnit) 
        : 0,
      status: this.getStockStatus(ingredient.stock),
    }));
  }

  // Get low stock alerts
  async getLowStock(orgId: string, threshold: number = 10) {
    const lowStockItems = await this.prisma.ingredient.findMany({
      where: {
        orgId,
        isActive: true,
        OR: [
          { stock: { lt: threshold } },
          { stock: null },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        unit: true,
        stock: true,
        supplier: true,
      },
      orderBy: { stock: 'asc' },
    });

    return lowStockItems.map((item) => ({
      ...item,
      stock: item.stock || 0,
      alert: item.stock === null || Number(item.stock) === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
    }));
  }

  // Get stock by ingredient type
  async getStockByType(orgId: string) {
    const ingredients = await this.prisma.ingredient.groupBy({
      by: ['type'],
      where: { orgId, isActive: true },
      _count: { id: true },
      _sum: { stock: true },
    });

    return ingredients.map((item) => ({
      type: item.type,
      count: item._count.id,
      totalStock: item._sum.stock || 0,
    }));
  }

  // Get movement statistics by type
  async getMovementStats(orgId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const movements = await this.prisma.stockMovement.groupBy({
      by: ['type'],
      where: {
        orgId,
        movedAt: { gte: startDate },
      },
      _count: { id: true },
      _sum: { quantity: true },
    });

    return movements.map((item) => ({
      type: item.type,
      count: item._count.id,
      totalQuantity: item._sum.quantity || 0,
    }));
  }

  // Get top suppliers by purchase volume
  async getTopSuppliers(orgId: string, limit: number = 5) {
    const suppliers = await this.prisma.supplier.findMany({
      where: { orgId, isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: { purchaseOrders: true },
        },
        purchaseOrders: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: {
        purchaseOrders: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      orderCount: supplier._count.purchaseOrders,
      totalValue: supplier.purchaseOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0,
      ),
    }));
  }

  // Get inventory value by ingredient
  async getInventoryValue(orgId: string) {
    const ingredients = await this.prisma.ingredient.findMany({
      where: { 
        orgId, 
        isActive: true,
        stock: { gt: 0 },
        costPerUnit: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        type: true,
        stock: true,
        costPerUnit: true,
        unit: true,
      },
      orderBy: { stock: 'desc' },
    });

    const items = ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      type: ingredient.type,
      stock: Number(ingredient.stock),
      costPerUnit: Number(ingredient.costPerUnit),
      unit: ingredient.unit,
      totalValue: Number(ingredient.stock) * Number(ingredient.costPerUnit),
    }));

    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

    return {
      items,
      totalValue,
      itemCount: items.length,
    };
  }

  // Get stock consumption trends (last 30 days)
  async getConsumptionTrends(orgId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await this.prisma.stockMovement.findMany({
      where: {
        orgId,
        type: { in: [MovementType.OUT, MovementType.BREWING, MovementType.SPOILAGE] },
        movedAt: { gte: thirtyDaysAgo },
      },
      select: {
        ingredientId: true,
        quantity: true,
        movedAt: true,
        ingredient: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    // Group by ingredient
    const grouped = movements.reduce((acc: any, movement) => {
      const key = movement.ingredientId;
      if (!acc[key]) {
        acc[key] = {
          ingredientId: movement.ingredientId,
          name: movement.ingredient.name,
          type: movement.ingredient.type,
          totalConsumed: 0,
          movementCount: 0,
        };
      }
      acc[key].totalConsumed += Number(movement.quantity);
      acc[key].movementCount += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a: any, b: any) => b.totalConsumed - a.totalConsumed,
    );
  }

  // Helper function to determine stock status
  private getStockStatus(stock: any): string {
    if (stock === null || Number(stock) === 0) return 'OUT_OF_STOCK';
    if (Number(stock) < 10) return 'LOW_STOCK';
    if (Number(stock) < 50) return 'ADEQUATE';
    return 'GOOD';
  }
}