import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from '@prisma/client';

export class CreateStockMovementDto {
  @IsString()
  ingredientId: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Type(() => Number)
  @Min(0.001)
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsOptional()
  movedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}