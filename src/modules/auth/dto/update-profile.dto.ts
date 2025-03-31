import { Constants } from "@configs";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(Constants.FIRST_NAME_MAX_LENGTH)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;
}
