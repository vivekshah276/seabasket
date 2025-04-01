import { UserEntity } from "@entities";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@configs";
import nodemailer from "nodemailer";
import { Bcrypt, InitRepository, InjectRepositories, JwtHelper } from "@helpers";
import { TRequest, TResponse } from "@types";
import { MoreThanOrEqual, Repository } from "typeorm";
import { ForgotPasswordDto, LoginDto, NewPasswordDto, SignupDto, UpdateUserDto } from "./dto";

const transporter = nodemailer.createTransport({
  host: env.email_host,
  port: env.email_port,
  auth: {
    user: env.email_auth_user,
    pass: env.email_auth_pass,
  },
});

interface CustomError extends Error {
  statusCode: number;
}

export class AuthController {
  @InitRepository(UserEntity)
  userRepository: Repository<UserEntity>;

  constructor() {
    InjectRepositories(this);
  }

  //signup user
  public PostSignup = async (req: TRequest<SignupDto>, res: TResponse): Promise<void> => {
    req.dto.password = await Bcrypt.hash(req.dto.password);

    try {
      const user = this.userRepository.create(req.dto);
      await this.userRepository.save(user);
      res.status(200).json({ success: true, user: user });
      return;
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
    }
  };

  //login with email or phone
  public PostLogin = async (req: TRequest<LoginDto>, res: TResponse): Promise<void> => {
    const { email, phone, password } = req.dto;

    try {
      if (!email && !phone) {
        const error = new Error("Enter phone or email") as CustomError;
        error.statusCode = 400;
        throw error;
      }
      const user = await this.userRepository.findOne({
        where: { ...(email ? { email } : { phone }) },
      });

      if (!user) {
        const error = new Error("User not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }
      const compare = await Bcrypt.verify(password, user.password);
      if (!compare) {
        res.status(400).json({ message: "Password not matched" });
        return;
      }

      const token = JwtHelper.encode({ id: user.id });
      res.status(200).json({ success: true, token: token });
      return;
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
    }
  };

  //forgot password via email
  public forgotPassword = async (req: TRequest<ForgotPasswordDto>, res: TResponse): Promise<void> => {
    const { email } = req.dto;
    try {
      crypto.randomBytes(32, async (error, buffer) => {
        if (error) {
          res.status(400).json({ message: "error!" });
        }
        const token = buffer.toString("hex");
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
          const error = new Error("User not found!") as CustomError;
          error.statusCode = 404;
          throw error;
        }
        user.resetToken = token;
        user.resetTokenExpiration = new Date(Date.now() + 3600000);
        await this.userRepository.save(user);

        const sendEmail = await transporter.sendMail({
          from: "earl.hirthe@ethereal.email",
          to: req.body.email,
          subject: "Reset Password link",
          html: `<h1>You TRequested a password reset</h1>
        <p><a href="https:localhost:3000/reset/${token}">to set a new password</a></p>
        `,
        });
        res.status(200).json({ success: true });
        return;
      });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
    }
  };

  //set new password
  public NewPassword = async (req: TRequest<NewPasswordDto>, res: TResponse): Promise<void> => {
    const { newPassword, passwordToken } = req.dto;

    try {
      const user = await this.userRepository.findOne({
        where: {
          resetToken: passwordToken,
          resetTokenExpiration: MoreThanOrEqual(new Date()),
        },
      });
      if (!user) {
        const error = new Error("User not found!!") as CustomError;
        error.statusCode = 404;
        throw error;
      }
      const hashedPassword = await Bcrypt.hash(newPassword);
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiration = null;
      await this.userRepository.save(user);
      res.status(200).json({ success: true, user: user });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
    }
  };

  //update the user profile
  public updateProfile = async (req: TRequest<UpdateUserDto>, res: TResponse): Promise<void> => {
    const userId = req.user.id;
    const { name, email, phone, password } = req.dto;
    try {
      const user = await this.userRepository.findOneById(userId);
      if (!user) {
        const error = new Error("no user found") as CustomError;
        error.statusCode = 404;
        throw error;
      }
      user.name = name || user?.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      if (password) {
        const hashedPassword = await Bcrypt.hash(password);
        user.password = hashedPassword;
      }
      this.userRepository.save(user);
      res.status(200).json({ success: true, user: user });
      return;
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
    }
  };
}
