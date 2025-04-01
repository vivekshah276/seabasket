import { InjectCls, SFRouter, Validator } from "@helpers";
import { RouterDelegates } from "@types";
import { CartController } from "./cart.controller";
import { AuthMiddleware } from "@middlewares";
import { CartDto } from "./dto";

export class CartRouter extends SFRouter implements RouterDelegates {
  @InjectCls(CartController)
  private cartController: CartController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/cart", this.authMiddleware.auth, this.cartController.getCart);
    this.router.post("/cart", Validator.validate(CartDto), this.authMiddleware.auth, this.cartController.postCart);
    this.router.delete("/cart", this.authMiddleware.auth, this.cartController.removeCartItems);
  }
}
