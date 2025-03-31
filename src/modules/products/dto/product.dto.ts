
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class ProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount: number;

  @IsString()
  category: string;
}
