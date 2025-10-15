import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createLocationDto: CreateLocationDto) {
    // Get user's organization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { orgId: true },  // ← Changed from organizationId
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.location.create({
      data: {
        ...createLocationDto,
        orgId: user.orgId,  // ← Changed from organizationId
      },
    });
  }

  async findAll(orgId: string) {  // ← Changed parameter name
    return this.prisma.location.findMany({
      where: { orgId },  // ← Changed from organizationId
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, orgId: string) {  // ← Changed parameter name
    const location = await this.prisma.location.findFirst({
      where: {
        id,
        orgId,  // ← Changed from organizationId
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(
    id: string,
    orgId: string,  // ← Changed parameter name
    updateLocationDto: CreateLocationDto,
  ) {
    await this.findOne(id, orgId);

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: string, orgId: string) {  // ← Changed parameter name
    await this.findOne(id, orgId);

    return this.prisma.location.delete({
      where: { id },
    });
  }
}