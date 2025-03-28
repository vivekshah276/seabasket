import { Router } from "express";
import { AuthRouter } from "@modules/auth";
import { Request, Response } from "express";

export default class Routes {
  public configure() {
    const router = Router();
    router.use("/auth", new AuthRouter().router);
    router.all("/*", (req: Request, res: Response) => {
      res.status(404).json({
        error: "ERR_URL_NOT_FOUND",
      });
    });
    return router;
  }
}
