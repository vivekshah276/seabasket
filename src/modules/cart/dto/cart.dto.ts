import { IsNotEmpty, IsNumber } from "class-validator";

export class CartDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
