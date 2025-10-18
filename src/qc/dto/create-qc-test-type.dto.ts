// src/qc/dto/create-qc-test-type.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateQcTestTypeDto {
  @ApiProperty({ example: 'Appearance Check' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Visual inspection of beer clarity' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'appearance', description: 'appearance, aroma, taste, clarity, carbonation' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'score' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  maxValue?: number;
}
