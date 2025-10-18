import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { BatchStatus } from '@prisma/client';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBatchDto: CreateBatchDto) {
    // Get user's organization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { orgId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orgId = user.orgId;

    // Verify recipe exists and belongs to organization
    const recipe = await this.prisma.recipe.findFirst({
      where: {
        id: createBatchDto.recipeId,
        orgId,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // Verify location if provided
    if (createBatchDto.locationId) {
      const location = await this.prisma.location.findFirst({
        where: {
          id: createBatchDto.locationId,
          orgId,
        },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }
    }

    // Verify tank if provided
    if (createBatchDto.tankId) {
      const tank = await this.prisma.tank.findFirst({
        where: {
          id: createBatchDto.tankId,
          organizationId: orgId,
        },
      });

      if (!tank) {
        throw new NotFoundException('Tank not found');
      }
    }

    // Generate batch number
    const batchNumber = await this.generateBatchNumber(orgId);

    // Convert brewDate string to Date object for Prisma
    const brewDate = new Date(createBatchDto.brewDate);

    // Create batch
    const batch = await this.prisma.batch.create({
      data: {
        recipeId: createBatchDto.recipeId,
        locationId: createBatchDto.locationId,
        tankId: createBatchDto.tankId,
        expectedVolume: createBatchDto.expectedVolume,
        notes: createBatchDto.notes,
        brewDate,
        batchNumber,
        orgId,
        status: 'PLANNED',
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            style: true,
            abv: true,
            ibu: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        tank: {
          select: {
            id: true,
            name: true,
            type: true,
            capacity: true,
          },
        },
      },
    });

    return batch;
  }

  async findAll(orgId: string, status?: BatchStatus) {
    const where: any = { orgId };
    
    if (status) {
      where.status = status;
    }

    return this.prisma.batch.findMany({
      where,
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            style: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        tank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: {
        id,
        orgId,
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            style: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        tank: {
          select: {
            id: true,
            name: true,
            type: true,
            capacity: true,
            status: true,
          },
        },
        fermentationLogs: {
          orderBy: { measuredAt: 'asc' },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return batch;
  }

  async update(id: string, orgId: string, updateBatchDto: UpdateBatchDto, userId: string) {
    const batch = await this.findOne(id, orgId);

    // Validate status transition
    if (updateBatchDto.status && updateBatchDto.status !== batch.status) {
      this.validateStatusTransition(batch.status as BatchStatus, updateBatchDto.status);
    }

    // Calculate ABV if both OG and FG are provided
    let abv: number | undefined;
    const og = updateBatchDto.og ?? batch.og;
    const fg = updateBatchDto.fg ?? batch.fg;

    if (og && fg) {
      const ogNum = typeof og === 'number' ? og : parseFloat(og.toString());
      const fgNum = typeof fg === 'number' ? fg : parseFloat(fg.toString());
      abv = parseFloat(((ogNum - fgNum) * 131.25).toFixed(2));
    }

    // Prepare update data
    const updateData: any = {
      ...updateBatchDto,
    };

    // Add ABV if calculated
    if (abv !== undefined) {
      updateData.abv = abv;
    }

    // Set date fields based on status
    if (updateBatchDto.status) {
      switch (updateBatchDto.status) {
        case 'FERMENTING':
          if (!batch.fermentationStartDate) {
            updateData.fermentationStartDate = new Date();
          }
          break;
        case 'PACKAGING':
          if (!batch.packagedDate) {
            updateData.packagedDate = new Date();
          }
          break;
        case 'FINISHED':
          if (!batch.finishedDate) {
            updateData.finishedDate = new Date();
          }
          break;
      }
    }

    const updatedBatch = await this.prisma.batch.update({
      where: { id },
      data: updateData,
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            style: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        tank: {
          select: {
            id: true,
            name: true,
          },
        },
        fermentationLogs: {
          orderBy: { measuredAt: 'asc' },
        },
      },
    });

    // Create status history entry if status changed
    if (updateBatchDto.status && updateBatchDto.status !== batch.status) {
      await this.prisma.batchStatusHistory.create({
        data: {
          batchId: id,
          toStatus: updateBatchDto.status,
          changedBy: userId,
          notes: updateBatchDto.notes,
        },
      });
    }

    return updatedBatch;
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId);

    return this.prisma.batch.delete({
      where: { id },
    });
  }

  async getStatistics(orgId: string) {
    const batches = await this.prisma.batch.findMany({
      where: { orgId },
      select: {
        status: true,
        actualVolume: true,
        expectedVolume: true,
        abv: true,
      },
    });

    const totalBatches = batches.length;
    const activeBatches = batches.filter(b => 
      ['BREWING', 'FERMENTING', 'CONDITIONING', 'PACKAGING'].includes(b.status)
    ).length;
    const finishedBatches = batches.filter(b => b.status === 'FINISHED').length;
    const cancelledBatches = batches.filter(b => b.status === 'CANCELLED').length;

    // Convert Decimal to number for calculation
    const totalVolume = batches
      .filter(b => b.actualVolume !== null)
      .reduce((sum, b) => {
        const volume = b.actualVolume ? parseFloat(b.actualVolume.toString()) : 0;
        return sum + volume;
      }, 0);

    const batchesWithAbv = batches.filter(b => b.abv !== null);
    const averageAbv = batchesWithAbv.length > 0
      ? (batchesWithAbv.reduce((sum, b) => {
          const abvValue = b.abv ? parseFloat(b.abv.toString()) : 0;
          return sum + abvValue;
        }, 0) / batchesWithAbv.length).toFixed(2)
      : '0.00';

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    batches.forEach(batch => {
      statusBreakdown[batch.status] = (statusBreakdown[batch.status] || 0) + 1;
    });

    return {
      totalBatches,
      activeBatches,
      finishedBatches,
      cancelledBatches,
      totalVolumeProduced: totalVolume,
      averageAbv,
      statusBreakdown,
    };
  }

  private async generateBatchNumber(orgId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `BR-${year}`;

    const lastBatch = await this.prisma.batch.findFirst({
      where: {
        orgId,
        batchNumber: {
          startsWith: prefix,
        },
      },
      orderBy: { batchNumber: 'desc' },
    });

    let sequence = 1;
    if (lastBatch) {
      const lastSequence = parseInt(lastBatch.batchNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(3, '0')}`;
  }

  private validateStatusTransition(currentStatus: BatchStatus, newStatus: BatchStatus) {
    const validTransitions: Record<BatchStatus, BatchStatus[]> = {
      PLANNED: ['BREWING', 'CANCELLED'],
      BREWING: ['FERMENTING', 'CANCELLED'],
      FERMENTING: ['CONDITIONING', 'CANCELLED'],
      CONDITIONING: ['PACKAGING', 'CANCELLED'],
      PACKAGING: ['FINISHED', 'CANCELLED'],
      FINISHED: [],
      CANCELLED: [],
    };

    const allowedStatuses = validTransitions[currentStatus];
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}