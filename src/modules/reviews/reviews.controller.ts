import { ProductEntity, ReviewsEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { Repository } from "typeorm";
import { ReviewsDto } from "./dto";
import { TRequest, TResponse } from "@types";

interface CustomError extends Error {
  statusCode?: number;
}

export class ReviewsController {
  @InitRepository(ReviewsEntity)
  reviewsRepository: Repository<ReviewsEntity>;

  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  constructor() {
    InjectRepositories(this);
  }

  //review posting
  public postReview = async (req: TRequest<ReviewsDto>, res: TResponse) => {
    try {
      const productId = Number(req.params.productId);
      const prod = await this.productRepository.findOne({ where: { id: productId } });

      if (!prod) {
        const error = new Error("No product") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      const { rating, review } = req.dto;
      const reviews = await this.reviewsRepository.create({
        rating,
        review,
        userId: req.user.id,
        productId,
      });
      this.reviewsRepository.save(reviews);

      res.status(200).json({ success: true, reviews });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //getting review
  public getReview = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const productId = Number(req.params.productId);
      const prod = await this.productRepository.find({ where: { id: productId } });

      if (!prod) {
        const error = new Error("No product") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      const review = await this.reviewsRepository.findOne({ where: { productId: productId } });

      if (!review) {
        res.status(200).json({ message: "no reviews" });
        return;
      }

      res.status(200).json({ success: true, review });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };
}
