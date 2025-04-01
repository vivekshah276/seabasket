import { Router } from "express";
import { AuthRouter } from "@modules/auth";
import { Request, Response } from "express";
import { ProductRouter } from "@modules/products";
import { ReviewsRouter } from "@modules/reviews";
import { CartRouter } from "@modules/cart";
import { OrderRouter } from "@modules/order";

export default class Routes {
  public configure() {
    const router = Router();
    router.use("/auth", new AuthRouter().router);
    router.use("/product", new ProductRouter().router);
    router.use("/reviews", new ReviewsRouter().router);
    router.use(new CartRouter().router);
    router.use(new OrderRouter().router);
    router.all("/*", (req: Request, res: Response) => {
      res.status(404).json({
        error: "ERR_URL_NOT_FOUND",
      });
    });
    return router;
  }
}
