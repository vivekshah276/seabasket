import { IsString, IsNumber, IsOptional, Min, Max } from "class-validator";

export class ProductFilterDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minDiscount?: number;

  @IsOptional()
  @IsString()
  category?: string;
}
