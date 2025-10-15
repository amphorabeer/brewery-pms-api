import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddFermentationLogDto {
  @ApiPropertyOptional({
    description: 'Measurement timestamp (ISO format, defaults to now)',
    example: '2025-01-20T14:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  measuredAt?: string;

  @ApiProperty({
    description: 'Temperature in Celsius',
    example: 18.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Temperature must be at least 0°C' })
  @Max(100, { message: 'Temperature cannot exceed 100°C' })
  temperature: number;

  @ApiPropertyOptional({
    description: 'Specific Gravity reading',
    example: 1.020,
    minimum: 0.990,
    maximum: 1.200,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.990)
  @Max(1.200)
  gravity?: number;

  @ApiPropertyOptional({
    description: 'pH level',
    example: 4.2,
    minimum: 0,
    maximum: 14,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  ph?: number;

  @ApiPropertyOptional({
    description: 'Pressure in PSI',
    example: 15.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pressure?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Fermentation progressing well, slight krausen forming',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}