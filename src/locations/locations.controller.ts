import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';  // ← Fixed path
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  create(@Request() req, @Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(req.user.userId, createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  findAll(@Request() req) {
    return this.locationsService.findAll(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.locationsService.findOne(id, req.user.orgId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update location' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateLocationDto: CreateLocationDto,
  ) {
    return this.locationsService.update(id, req.user.orgId, updateLocationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete location' })
  remove(@Request() req, @Param('id') id: string) {
    return this.locationsService.remove(id, req.user.orgId);
  }
}