import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { PackageType } from '@prisma/client';

export class CreatePackageFormatDto {
  @IsString()
  name: string;

  @IsEnum(PackageType)
  type: PackageType;

  @IsNumber()
  size: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
