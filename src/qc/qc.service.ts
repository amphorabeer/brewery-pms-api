import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQcTestTypeDto } from './dto/create-qc-test-type.dto';
import { UpdateQcTestTypeDto } from './dto/update-qc-test-type.dto';
import { CreateQcTestDto } from './dto/create-qc-test.dto';
import { UpdateQcTestDto } from './dto/update-qc-test.dto';

@Injectable()
export class QcService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // QC TEST TYPES
  // ========================================

  async createTestType(orgId: string, dto: CreateQcTestTypeDto) {
    return this.prisma.qcTestType.create({
      data: {
        ...dto,
        orgId,
      },
    });
  }

  async findAllTestTypes(orgId: string, activeOnly = true) {
    const where: any = { orgId };
    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.qcTestType.findMany({
      where,
      orderBy: { category: 'asc' },
    });
  }

  async findOneTestType(id: string, orgId: string) {
    const testType = await this.prisma.qcTestType.findFirst({
      where: { id, orgId },
    });

    if (!testType) {
      throw new NotFoundException('QC Test Type not found');
    }

    return testType;
  }

  async updateTestType(id: string, orgId: string, dto: UpdateQcTestTypeDto) {
    await this.findOneTestType(id, orgId);

    return this.prisma.qcTestType.update({
      where: { id },
      data: dto,
    });
  }

  async removeTestType(id: string, orgId: string) {
    await this.findOneTestType(id, orgId);

    return this.prisma.qcTestType.delete({
      where: { id },
    });
  }

  // ========================================
  // QC TESTS
  // ========================================

  async createTest(userId: string, orgId: string, dto: CreateQcTestDto) {
    // Verify batch exists and belongs to organization
    const batch = await this.prisma.batch.findFirst({
      where: {
        id: dto.batchId,
        orgId,
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Verify test type exists
    await this.findOneTestType(dto.testTypeId, orgId);

    return this.prisma.qcTest.create({
      data: {
        ...dto,
        testedAt: new Date(dto.testedAt),
        testedBy: userId,
      },
      include: {
        testType: true,
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
  }

  async findAllTests(orgId: string, batchId?: string) {
    const where: any = {};

    if (batchId) {
      // Verify batch belongs to organization
      const batch = await this.prisma.batch.findFirst({
        where: { id: batchId, orgId },
      });

      if (!batch) {
        throw new NotFoundException('Batch not found');
      }

      where.batchId = batchId;
    } else {
      // Get all tests for organization's batches
      where.batch = {
        orgId,
      };
    }

    return this.prisma.qcTest.findMany({
      where,
      include: {
        testType: true,
        batch: {
          select: {
            id: true,
            batchNumber: true,
            recipe: {
              select: {
                id: true,
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
          },
        },
      },
      orderBy: { testedAt: 'desc' },
    });
  }

  async findOneTest(id: string, orgId: string) {
    const test = await this.prisma.qcTest.findFirst({
      where: {
        id,
        batch: {
          orgId,
        },
      },
      include: {
        testType: true,
        batch: {
          select: {
            id: true,
            batchNumber: true,
            recipe: {
              select: {
                id: true,
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

    if (!test) {
      throw new NotFoundException('QC Test not found');
    }

    return test;
  }

  async updateTest(id: string, orgId: string, dto: UpdateQcTestDto) {
    await this.findOneTest(id, orgId);

    return this.prisma.qcTest.update({
      where: { id },
      data: {
        ...dto,
        testedAt: dto.testedAt ? new Date(dto.testedAt) : undefined,
      },
      include: {
        testType: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async removeTest(id: string, orgId: string) {
    await this.findOneTest(id, orgId);

    return this.prisma.qcTest.delete({
      where: { id },
    });
  }

  // ========================================
  // STATISTICS
  // ========================================

  async getTestStats(orgId: string, batchId?: string) {
    const where: any = {};

    if (batchId) {
      where.batchId = batchId;
    } else {
      where.batch = { orgId };
    }

    const tests = await this.prisma.qcTest.findMany({
      where,
      select: {
        result: true,
      },
    });

    const stats = {
      total: tests.length,
      passed: tests.filter((t) => t.result === 'PASS').length,
      failed: tests.filter((t) => t.result === 'FAIL').length,
      pending: tests.filter((t) => t.result === 'PENDING').length,
    };

    return {
      ...stats,
      passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0',
    };
  }
}