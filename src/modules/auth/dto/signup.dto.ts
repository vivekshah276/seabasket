import { Constants } from "@configs";
import { IsEmail, IsNotEmpty, IsNumber, IsString, Length, Matches, MaxLength } from "class-validator";

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.FIRST_NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;
}
