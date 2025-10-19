import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @IsString()
  ingredientId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0.001)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice: number;

  @IsString()
  @IsOptional()
  notes?: string;
}