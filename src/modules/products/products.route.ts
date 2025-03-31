import {AuthMiddleware} from "@middlewares";
import { ProductController } from "./products.controller";
import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { CartDto, CategoryDto, OrderDto, ProductDto, ReviewsDto } from "./dto";

export class ProductRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ProductController)
  private productController: ProductController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/products", this.productController.getProducts);
    this.router.post("/addproduct",Validator.validate(ProductDto), this.authMiddleware.auth, this.productController.addProduct);
    this.router.delete("/product/:productId",this.authMiddleware.auth, this.productController.deleteProduct);
    this.router.get("/product/:productId", this.productController.getProduct);

    this.router.get("/category", this.productController.getCategory);
    this.router.post("/addcategory",Validator.validate(CategoryDto), this.authMiddleware.auth, this.productController.addCategory);

    this.router.get("/products/filter", this.productController.filterProducts);
    this.router.get("/search", this.productController.searchProduct);

    this.router.get("/trendingproducts", this.productController.trendingProducts);

    this.router.get("/products/:productId/review", this.productController.getReview);
    this.router.post("/products/:productId/review",Validator.validate(ReviewsDto), this.authMiddleware.auth, this.productController.postReview);

    this.router.get("/cart", this.authMiddleware.auth, this.productController.getCart);
    this.router.post("/cart",Validator.validate(CartDto), this.authMiddleware.auth, this.productController.postCart);
    this.router.delete("/cart", this.authMiddleware.auth, this.productController.removeCartItems);

    this.router.post("/order",Validator.validate(OrderDto), this.authMiddleware.auth, this.productController.postOrder);
    this.router.get("/order", this.authMiddleware.auth, this.productController.getOrder);
    this.router.get("/order/:orderId", this.authMiddleware.auth, this.productController.orderDetails);
  }
}
