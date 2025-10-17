import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddIngredientToRecipeDto {
  @IsString()
  ingredientId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  timing?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}