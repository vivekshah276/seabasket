import { InjectCls, SFRouter, Validator } from "@helpers";
import { RouterDelegates } from "@types";
import { ReviewsController } from "./reviews.controller";
import { AuthMiddleware } from "@middlewares";
import { ReviewsDto } from "./dto";

export class ReviewsRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ReviewsController)
  private reviewsController: ReviewsController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/products/:productId/review", this.reviewsController.getReview);
    this.router.post("/products/:productId/review", Validator.validate(ReviewsDto), this.authMiddleware.auth, this.reviewsController.postReview);
  }
}
