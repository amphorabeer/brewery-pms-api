// src/qc/dto/create-qc-test.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum QcTestResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  PENDING = 'PENDING',
}

export class CreateQcTestDto {
  @ApiProperty({ example: 'batch-uuid' })
  @IsString()
  batchId: string;

  @ApiProperty({ example: 'test-type-uuid' })
  @IsString()
  testTypeId: string;

  @ApiProperty({ example: '2025-10-18T10:00:00Z' })
  @IsDateString()
  testedAt: string;

  @ApiProperty({ enum: QcTestResult, default: QcTestResult.PENDING })
  @IsEnum(QcTestResult)
  result: QcTestResult;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ example: 'Excellent clarity, no haze' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: ['https://example.com/photo.jpg'] })
  @IsOptional()
  attachments?: any;
}
