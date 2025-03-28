import { Constants } from "@configs";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";

export class LoginDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;
}
