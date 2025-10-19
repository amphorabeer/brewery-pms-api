import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  // Generate unique PO number
  private async generatePoNumber(orgId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.purchaseOrder.count({
      where: {
        orgId,
        poNumber: { startsWith: `PO-${year}-` },
      },
    });

    return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Create new purchase order
  async create(orgId: string, userId: string, createDto: CreatePurchaseOrderDto) {
    // Verify supplier exists and belongs to organization
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: createDto.supplierId, orgId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Verify all ingredients exist
    const ingredientIds = createDto.items.map((item) => item.ingredientId);
    const ingredients = await this.prisma.ingredient.findMany({
      where: { id: { in: ingredientIds }, orgId },
    });

    if (ingredients.length !== ingredientIds.length) {
      throw new BadRequestException('One or more ingredients not found');
    }

    // Generate PO number
    const poNumber = await this.generatePoNumber(orgId);

    // Calculate total amount
    const totalAmount = createDto.items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    // Create purchase order with items
    return this.prisma.purchaseOrder.create({
      data: {
        orgId,
        supplierId: createDto.supplierId,
        poNumber,
        orderDate: createDto.orderDate ? new Date(createDto.orderDate) : new Date(),
        expectedDate: createDto.expectedDate ? new Date(createDto.expectedDate) : null,
        notes: createDto.notes,
        totalAmount,
        createdBy: userId,
        items: {
          create: createDto.items.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  // Get all purchase orders
  async findAll(orgId: string, search?: string, status?: PurchaseOrderStatus) {
    const where: any = { orgId };

    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });
  }

  // Get purchase order by ID
  async findOne(id: string, orgId: string) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, orgId },
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    return order;
  }

  // Update purchase order
  async update(id: string, orgId: string, updateDto: UpdatePurchaseOrderDto) {
    // Verify order exists
    await this.findOne(id, orgId);

    // If updating supplier, verify it exists
    if (updateDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: updateDto.supplierId, orgId },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: updateDto.supplierId,
        status: updateDto.status,
        orderDate: updateDto.orderDate ? new Date(updateDto.orderDate) : undefined,
        expectedDate: updateDto.expectedDate ? new Date(updateDto.expectedDate) : undefined,
        receivedDate: updateDto.receivedDate ? new Date(updateDto.receivedDate) : undefined,
        notes: updateDto.notes,
      },
      include: {
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  // Receive purchase order
  async receive(id: string, orgId: string, userId: string, locationId?: string) {
    const order = await this.findOne(id, orgId);

    if (order.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Order already received');
    }

    if (order.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot receive cancelled order');
    }

    // Update order status
    const updatedOrder = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.RECEIVED,
        receivedDate: new Date(),
      },
      include: {
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    // Create stock movements for each item
    const stockMovements = order.items.map((item) => ({
      orgId,
      ingredientId: item.ingredientId,
      locationId: locationId || null,
      type: 'IN' as const,
      quantity: item.quantity,
      unit: item.unit,
      reason: `Purchase Order: ${order.poNumber}`,
      reference: order.poNumber,
      movedBy: userId,
      movedAt: new Date(),
    }));

    await this.prisma.stockMovement.createMany({
      data: stockMovements,
    });

    // Update ingredient stock
    for (const item of order.items) {
      await this.prisma.ingredient.update({
        where: { id: item.ingredientId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    return updatedOrder;
  }

  // Delete purchase order (only DRAFT)
  async remove(id: string, orgId: string) {
    const order = await this.findOne(id, orgId);

    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only delete DRAFT orders');
    }

    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }

  // Get statistics
  async getStats(orgId: string) {
    const [total, draft, sent, received, cancelled] = await Promise.all([
      this.prisma.purchaseOrder.count({ where: { orgId } }),
      this.prisma.purchaseOrder.count({ where: { orgId, status: PurchaseOrderStatus.DRAFT } }),
      this.prisma.purchaseOrder.count({ where: { orgId, status: PurchaseOrderStatus.SENT } }),
      this.prisma.purchaseOrder.count({ where: { orgId, status: PurchaseOrderStatus.RECEIVED } }),
      this.prisma.purchaseOrder.count({ where: { orgId, status: PurchaseOrderStatus.CANCELLED } }),
    ]);

    const totalValue = await this.prisma.purchaseOrder.aggregate({
      where: { orgId, status: { not: PurchaseOrderStatus.CANCELLED } },
      _sum: { totalAmount: true },
    });

    return {
      total,
      draft,
      sent,
      received,
      cancelled,
      totalValue: totalValue._sum.totalAmount || 0,
    };
  }
}