import { IsInt, IsNotEmpty, IsString } from "class-validator";
import dotenv from "dotenv";

dotenv.config();

class Env {
  @IsNotEmpty()
  public dbType: any;

  @IsNotEmpty()
  public dbHost!: string;

  @IsNotEmpty()
  @IsString()
  public dbName!: string;

  @IsNotEmpty()
  @IsString()
  public db_username!: string;

  @IsNotEmpty()
  @IsString()
  public db_password!: string;

  @IsInt()
  public port!: number;

  @IsNotEmpty()
  @IsString()
  public email_host!: string;

  @IsInt()
  public email_port!: number;

  @IsNotEmpty()
  @IsString()
  public email_auth_user!: string;

  @IsNotEmpty()
  @IsString()
  public email_auth_pass!: string;

  @IsNotEmpty()
  @IsString()
  public domain!: string;

  @IsNotEmpty()
  @IsString()
  public nodeEnv!: string;
}

export const env = new Env();

  env.dbType = process.env.DB_TYPE as string;
  env.dbHost = process.env.DB_HOST as string;
  env.dbName= process.env.DB_NAME as string;
  env.db_username= process.env.DB_USERNAME as string;
  env.db_password= process.env.DB_PASSWORD as string;
  env.port= Number(process.env.PORT as string);
  env.email_host= process.env.EMAIL_HOST as string;
  env.email_port= Number(process.env.EMAIL_PORT as string);
  env.email_auth_user= process.env.EMAIL_AUTH_USER as string;
  env.email_auth_pass= process.env.EMAIL_AUTH_PASS as string;
  env.domain = process.env.DOMAIN as string;
  env.nodeEnv = process.env.NODE_ENV as string;


