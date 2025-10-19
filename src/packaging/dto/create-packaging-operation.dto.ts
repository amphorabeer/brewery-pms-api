import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { PackagingStatus } from '@prisma/client';

export class CreatePackagingOperationDto {
  @IsString()
  batchId: string;

  @IsString()
  packageFormatId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  volumePackaged: number;

  @IsDateString()
  packagedAt: string;

  @IsOptional()
  @IsEnum(PackagingStatus)
  status?: PackagingStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
