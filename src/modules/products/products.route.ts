import { AuthMiddleware } from "@middlewares";
import { ProductController } from "./products.controller";
import { RouterDelegates } from "@types";
import { InjectCls, SFRouter, Validator } from "@helpers";
import { CategoryDto, ProductDto } from "./dto";

export class ProductRouter extends SFRouter implements RouterDelegates {
  @InjectCls(ProductController)
  private productController: ProductController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.get("/products", this.productController.getProducts);
    this.router.post("/addproduct", Validator.validate(ProductDto), this.authMiddleware.auth, this.productController.addProduct);
    this.router.delete("/product/:productId", this.authMiddleware.auth, this.productController.deleteProduct);
    this.router.get("/product/:productId", this.productController.getProduct);

    this.router.get("/category", this.productController.getCategory);
    this.router.post("/addcategory", Validator.validate(CategoryDto), this.authMiddleware.auth, this.productController.addCategory);

    this.router.get("/products/filter", this.productController.filterProducts);
    this.router.get("/search", this.productController.searchProduct);

    this.router.get("/trendingproducts", this.productController.trendingProducts);
  }
}
