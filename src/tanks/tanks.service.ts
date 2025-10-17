import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TanksService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.tank.findMany({
      where: { organizationId: orgId },
      include: {
        batches: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const tank = await this.prisma.tank.findFirst({
      where: { id, organizationId: orgId },
      include: {
        batches: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!tank) {
      throw new NotFoundException('Tank not found');
    }

    return tank;
  }

  async create(orgId: string, data: any) {
    return this.prisma.tank.create({
      data: {
        ...data,
        organizationId: orgId,
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    const tank = await this.prisma.tank.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!tank) {
      throw new NotFoundException('Tank not found');
    }

    return this.prisma.tank.update({
      where: { id },
      data,
    });
  }

  async delete(orgId: string, id: string) {
    const tank = await this.prisma.tank.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!tank) {
      throw new NotFoundException('Tank not found');
    }

    return this.prisma.tank.delete({
      where: { id },
    });
  }
}
