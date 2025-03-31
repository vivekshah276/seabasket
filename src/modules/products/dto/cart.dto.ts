import { isNotEmpty, IsNotEmpty, IsNumber, Min } from "class-validator";

export class CartDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
