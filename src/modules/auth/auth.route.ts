import { InjectCls, SFRouter, Validator } from "@helpers";
import { ForgotPasswordDto, LoginDto, NewPasswordDto, SignupDto, UpdateUserDto } from "./dto";
import { RouterDelegates } from "@types";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "@middlewares";

export class AuthRouter extends SFRouter implements RouterDelegates {
  @InjectCls(AuthController)
  private userController: AuthController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {

    this.router.post("/signup",Validator.validate(SignupDto),this.userController.PostSignup);

    this.router.post("/login",Validator.validate(LoginDto), this.userController.PostLogin);

    this.router.post("/forgotpassword",Validator.validate(ForgotPasswordDto), this.userController.forgotPassword);

    this.router.put("/newpassword", Validator.validate(NewPasswordDto),this.userController.NewPassword);

    this.router.patch("/updateprofile",Validator.validate(UpdateUserDto), this.authMiddleware.auth, this.userController.updateProfile);
  }
}

