import { AuthMiddleware } from "@middlewares";
import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { OrderDto } from "./dto";
import { OrderController } from "./order.controller";

export class OrderRouter extends SFRouter implements RouterDelegates {
  @InjectCls(OrderController)
  private orderController: OrderController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/order", Validator.validate(OrderDto), this.authMiddleware.auth, this.orderController.postOrder);
    this.router.get("/order", this.authMiddleware.auth, this.orderController.getOrder);
    this.router.get("/order/:orderId", this.authMiddleware.auth, this.orderController.orderDetails);
  }
}
