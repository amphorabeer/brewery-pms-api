import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string; // Grain, Hop, Yeast, Adjunct, Water, Other

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsNumber()
  @IsOptional()
  costPerUnit?: number;

  @IsString()
  @IsOptional()
  unit?: string; // kg, g, l, ml, unit

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}