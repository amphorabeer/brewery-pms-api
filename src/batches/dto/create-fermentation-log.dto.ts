import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFermentationLogDto {
  @ApiProperty({
    example: '2025-10-18T10:00:00Z',
    description: 'Measurement timestamp',
  })
  @IsDateString()
  measuredAt: string;

  @ApiProperty({
    example: 18.5,
    description: 'Temperature in Celsius',
  })
  @IsNumber()
  temperature: number;

  @ApiPropertyOptional({
    example: 1.05,
    description: 'Specific gravity',
  })
  @IsOptional()
  @IsNumber()
  gravity?: number;

  @ApiPropertyOptional({
    example: 4.5,
    description: 'pH level',
  })
  @IsOptional()
  @IsNumber()
  ph?: number;

  @ApiPropertyOptional({
    example: 12.0,
    description: 'Pressure in PSI',
  })
  @IsOptional()
  @IsNumber()
  pressure?: number;

  @ApiPropertyOptional({
    example: 'Active fermentation',
    description: 'Notes about this reading',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}