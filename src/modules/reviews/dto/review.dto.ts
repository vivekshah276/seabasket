import { IsNumber, IsString, Min, Max } from "class-validator";

export class ReviewsDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsString()
  review: string;
}
