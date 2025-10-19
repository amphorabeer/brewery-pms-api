import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageFormatDto } from './dto/create-package-format.dto';
import { CreatePackagingOperationDto } from './dto/create-packaging-operation.dto';

@Injectable()
export class PackagingService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // PACKAGE FORMATS
  // ==========================================

  async createPackageFormat(orgId: string, dto: CreatePackageFormatDto) {
    return this.prisma.packageFormat.create({
      data: {
        orgId,
        ...dto,
      },
    });
  }

  async getPackageFormats(orgId: string, activeOnly = true) {
    return this.prisma.packageFormat.findMany({
      where: {
        orgId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPackageFormatById(id: string, orgId: string) {
    const format = await this.prisma.packageFormat.findFirst({
      where: { id, orgId },
    });

    if (!format) {
      throw new NotFoundException('Package format not found');
    }

    return format;
  }

  async updatePackageFormat(id: string, orgId: string, dto: Partial<CreatePackageFormatDto>) {
    await this.getPackageFormatById(id, orgId);

    return this.prisma.packageFormat.update({
      where: { id },
      data: dto,
    });
  }

  async deletePackageFormat(id: string, orgId: string) {
    await this.getPackageFormatById(id, orgId);

    return this.prisma.packageFormat.delete({
      where: { id },
    });
  }

  // ==========================================
  // PACKAGING OPERATIONS
  // ==========================================

  generateSKU(batchNumber: string, packageType: string, timestamp: Date): string {
    const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const typeCode = packageType.substring(0, 3).toUpperCase();
    return `${batchNumber}-${typeCode}-${dateStr}`;
  }

  async createPackagingOperation(userId: string, orgId: string, dto: CreatePackagingOperationDto) {
    // Verify batch belongs to organization
    const batch = await this.prisma.batch.findFirst({
      where: {
        id: dto.batchId,
        orgId,
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Verify package format belongs to organization
    const packageFormat = await this.prisma.packageFormat.findFirst({
      where: {
        id: dto.packageFormatId,
        orgId,
      },
    });

    if (!packageFormat) {
      throw new NotFoundException('Package format not found');
    }

    // Generate SKU
    const sku = this.generateSKU(
      batch.batchNumber,
      packageFormat.type,
      new Date(dto.packagedAt),
    );

    return this.prisma.packagingOperation.create({
      data: {
        ...dto,
        sku,
        packagedBy: userId,
      },
      include: {
        batch: {
          select: {
            batchNumber: true,
            recipe: {
              select: {
                name: true,
              },
            },
          },
        },
        packageFormat: true,
      },
    });
  }

  async getPackagingOperations(orgId: string, batchId?: string) {
    return this.prisma.packagingOperation.findMany({
      where: {
        batch: {
          orgId,
        },
        ...(batchId && { batchId }),
      },
      include: {
        batch: {
          select: {
            batchNumber: true,
            recipe: {
              select: {
                name: true,
              },
            },
          },
        },
        packageFormat: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { packagedAt: 'desc' },
    });
  }

  async getPackagingOperationById(id: string, orgId: string) {
    const operation = await this.prisma.packagingOperation.findFirst({
      where: {
        id,
        batch: {
          orgId,
        },
      },
      include: {
        batch: {
          select: {
            batchNumber: true,
            recipe: {
              select: {
                name: true,
              },
            },
          },
        },
        packageFormat: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!operation) {
      throw new NotFoundException('Packaging operation not found');
    }

    return operation;
  }

  async updatePackagingOperation(
    id: string,
    orgId: string,
    dto: Partial<CreatePackagingOperationDto>,
  ) {
    await this.getPackagingOperationById(id, orgId);

    return this.prisma.packagingOperation.update({
      where: { id },
      data: dto,
      include: {
        batch: {
          select: {
            batchNumber: true,
            recipe: {
              select: {
                name: true,
              },
            },
          },
        },
        packageFormat: true,
      },
    });
  }

  async deletePackagingOperation(id: string, orgId: string) {
    await this.getPackagingOperationById(id, orgId);

    return this.prisma.packagingOperation.delete({
      where: { id },
    });
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  async getPackagingStats(orgId: string, batchId?: string) {
    const operations = await this.prisma.packagingOperation.findMany({
      where: {
        batch: {
          orgId,
        },
        ...(batchId && { batchId }),
      },
      include: {
        packageFormat: true,
      },
    });

    const totalOperations = operations.length;
    const totalVolume = operations.reduce(
      (sum, op) => sum + Number(op.volumePackaged),
      0,
    );
    const totalPackages = operations.reduce((sum, op) => sum + op.quantity, 0);

    const byType = operations.reduce((acc, op) => {
      const type = op.packageFormat.type;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          volume: 0,
          packages: 0,
        };
      }
      acc[type].count += 1;
      acc[type].volume += Number(op.volumePackaged);
      acc[type].packages += op.quantity;
      return acc;
    }, {} as Record<string, { count: number; volume: number; packages: number }>);

    const byStatus = operations.reduce((acc, op) => {
      const status = op.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOperations,
      totalVolume,
      totalPackages,
      byType,
      byStatus,
    };
  }
}
