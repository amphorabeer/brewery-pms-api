import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // Create new supplier
  async create(orgId: string, createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        orgId,
        ...createSupplierDto,
      },
    });
  }

  // Get all suppliers for organization
  async findAll(orgId: string, search?: string) {
    const where: any = { orgId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.supplier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });
  }

  // Get supplier by ID
  async findOne(id: string, orgId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, orgId },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  // Update supplier
  async update(id: string, orgId: string, updateSupplierDto: UpdateSupplierDto) {
    // Check if supplier exists and belongs to organization
    await this.findOne(id, orgId);

    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  // Delete supplier
  async remove(id: string, orgId: string) {
    // Check if supplier exists and belongs to organization
    await this.findOne(id, orgId);

    // Check if supplier has purchase orders
    const ordersCount = await this.prisma.purchaseOrder.count({
      where: { supplierId: id },
    });

    if (ordersCount > 0) {
      throw new Error(
        `Cannot delete supplier with ${ordersCount} purchase orders. Deactivate instead.`,
      );
    }

    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  // Get supplier statistics
  async getStats(orgId: string) {
    const [total, active, inactive] = await Promise.all([
      this.prisma.supplier.count({ where: { orgId } }),
      this.prisma.supplier.count({ where: { orgId, isActive: true } }),
      this.prisma.supplier.count({ where: { orgId, isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }

  // Toggle supplier active status
  async toggleActive(id: string, orgId: string) {
    const supplier = await this.findOne(id, orgId);

    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
    });
  }
}