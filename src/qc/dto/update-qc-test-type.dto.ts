
// src/qc/dto/update-qc-test-type.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateQcTestTypeDto } from './create-qc-test-type.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateQcTestTypeDto extends PartialType(CreateQcTestTypeDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

