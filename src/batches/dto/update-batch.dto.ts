import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BatchStatus } from '@prisma/client';

export class UpdateBatchDto {
  @ApiPropertyOptional({ 
    enum: BatchStatus,
    example: 'BREWING'
  })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiPropertyOptional({ example: 98.5 })
  @IsOptional()
  @IsNumber()
  actualVolume?: number;

  @ApiPropertyOptional({ example: 1.055 })
  @IsOptional()
  @IsNumber()
  og?: number;

  @ApiPropertyOptional({ example: 1.012 })
  @IsOptional()
  @IsNumber()
  fg?: number;

  @ApiPropertyOptional({ example: 'Batch notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}