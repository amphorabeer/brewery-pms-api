import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty({ message: 'Recipe name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Style is required' })
  style: string;

  @IsNumber()
  @Min(1, { message: 'Batch size must be at least 1 liter' })
  batchSize: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  abv?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ibu?: number;

  @IsNumber()
  @IsOptional()
  og?: number;

  @IsNumber()
  @IsOptional()
  fg?: number;

  @IsNumber()
  @IsOptional()
  mashTemp?: number;

  @IsNumber()
  @IsOptional()
  mashTime?: number;

  @IsNumber()
  @IsOptional()
  boilTime?: number;

  @IsNumber()
  @IsOptional()
  fermentTemp?: number;

  @IsNumber()
  @IsOptional()
  fermentDays?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}