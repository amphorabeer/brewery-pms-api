import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({ 
    example: 'b2345678-9abc-def0-1234-56789abcdef0',
    description: 'Recipe ID'
  })
  @IsUUID()
  recipeId: string;

  @ApiPropertyOptional({ 
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
    description: 'Location ID (Optional)'
  })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ 
    example: 'c3456789-0abc-def1-2345-6789abcdef01',
    description: 'Tank ID (Optional)'
  })
  @IsOptional()
  @IsUUID()
  tankId?: string;

  @ApiProperty({ 
    example: 100,
    description: 'Expected volume in liters'
  })
  @IsNumber()
  expectedVolume: number;

  @ApiProperty({ 
    example: '2025-10-14T10:00:00Z',
    description: 'Planned brew date'
  })
  @IsDateString()
  brewDate: string;

  @ApiPropertyOptional({ 
    example: 'First test batch',
    description: 'Batch notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}