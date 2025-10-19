import {
    IsString,
    IsOptional,
    IsDateString,
    IsArray,
    ValidateNested,
    ArrayMinSize,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { CreatePurchaseOrderItemDto } from './create-purchase-order-item.dto';
  
  export class CreatePurchaseOrderDto {
    @IsString()
    supplierId: string;
  
    @IsDateString()
    @IsOptional()
    orderDate?: string;
  
    @IsDateString()
    @IsOptional()
    expectedDate?: string;
  
    @IsString()
    @IsOptional()
    notes?: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseOrderItemDto)
    @ArrayMinSize(1)
    items: CreatePurchaseOrderItemDto[];
  }