import { CartEntity, CartItemsEntity, CategoryProductEntity, OrderEntity, OrderItemEntity, ProductEntity, ReviewsEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Between, In, Like, MoreThanOrEqual, Repository } from "typeorm";
import { CategoryDto, ProductDto } from "./dto";

interface CustomError extends Error {
  statusCode?: number;
}

export class ProductController {
  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  @InitRepository(CategoryProductEntity)
  categoryProductRepository: Repository<CategoryProductEntity>;

  constructor() {
    InjectRepositories(this);
  }

  //Fetch all the products - Product Listing
  public getProducts = async (req: TRequest, res: TResponse) => {
    try {
      const allProducts = await this.productRepository.find();

      res.status(200).json({ success: true, allproducts: allProducts });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //fetch single product detail - Product Listing & Product Details
  public getProduct = async (req: TRequest, res: TResponse) => {
    const prodId = Number(req.params.productId);
    try {
      const product = await this.productRepository.findOne({ where: { id: prodId } });

      res.status(200).json({ success: true, product: product });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //create a product
  public addProduct = async (req: TRequest<ProductDto>, res: TResponse): Promise<void> => {
    const { name, price, rating, discount, category } = req.dto;
    const userId = req.user.id;
    try {
      const categoryProduct = await this.categoryProductRepository.findOne({
        where: { name: category },
      });

      if (!categoryProduct) {
        const error: CustomError = new Error("Category Not found");
        error.statusCode = 404;
        throw error;
      }

      const categoryId = categoryProduct.id;

      // Check if product already exists in this category
      const existingProduct = await this.productRepository.findOne({
        where: { name, categoryId },
      });

      if (existingProduct) {
        res.status(400).json({ success: false, message: "Product already exists in this category" });
        return;
      }

      const product = await this.productRepository.create({
        name,
        price,
        rating,
        discount,
        userId,
        categoryId,
      });
      await this.productRepository.save(product);

      res.status(201).json({ success: true, product: product });
      return;
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //delete existed product
  public deleteProduct = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const prodId = Number(req.params.productId);
      const product = await this.productRepository.findOne({ where: { id: prodId } });

      if (!product) {
        res.status(404).json({ message: "No Product Found" });
        return;
      }

      await this.productRepository.delete(prodId);

      res.status(200).json({ success: true, message: "product deleted successfully" });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //get all the category list - Home
  public getCategory = async (req: TRequest, res: TResponse) => {
    const allCategory = await this.categoryProductRepository.find();

    if (!allCategory) {
      throw new Error("No Category Product");
    }

    res.status(200).json({ success: true, allCategory: allCategory });
  };

  //add the categories
  public addCategory = async (req: TRequest<CategoryDto>, res: TResponse) => {
    const { name } = req.dto;
    try {
      const isExistcategory = await this.categoryProductRepository.findOne({ where: { name: name } });

      if (isExistcategory) {
        res.status(400).json({ message: "Category already exist" });
        return;
      }

      const category = await this.categoryProductRepository.create(req.dto);
      this.categoryProductRepository.save(category);

      res.status(201).json({ success: true, category: category });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //filter and sorting the products - Product Listing
  public filterProducts = async (req: TRequest, res: TResponse) => {
    const { minPrice, maxPrice, minRating, minDiscount, category, sortBy } = req.query;
    const whereClause: Record<string, any> = {};
    const orderClause: Record<string, "ASC" | "DESC"> = {};

    try {
      if (minPrice && maxPrice) {
        whereClause.price = Between(parseFloat(minPrice as string), parseFloat(maxPrice as string));
      }

      if (minRating) {
        whereClause.rating = MoreThanOrEqual(parseFloat(minRating as string));
      }

      if (minDiscount) {
        whereClause.discount = MoreThanOrEqual(parseFloat(minDiscount as string));
      }

      if (category) {
        whereClause.category = category;
      }

      if (sortBy === "price_asc") {
        orderClause["price"] = "ASC";
      } else if (sortBy === "price_desc") {
        orderClause["price"] = "DESC";
      } else if (sortBy === "name_asc") {
        orderClause["name"] = "ASC";
      } else if (sortBy === "name_desc") {
        orderClause["name"] = "DESC";
      }
      const product = await this.productRepository.find({
        where: whereClause,
        order: orderClause,
      });

      res.status(200).json({ success: true, product: product });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //fetch all the trending products
  public trendingProducts = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const trendProducts = await this.productRepository.find({
        where: { rating: MoreThanOrEqual(4) },
        take: 10,
        order: { updatedAt: "DESC" },
      });

      if (!trendProducts.length) {
        res.status(404).json({ error: "No trending products found" });
        return;
      }

      res.status(200).json({ success: true, trendProducts });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };

  //Search the product - Home
  public searchProduct = async (req: TRequest, res: TResponse): Promise<void> => {
    const { name } = req.body;
    try {
      const product = await this.productRepository.find({ where: { name: Like(`%${name}%`) } });
      const category = await this.categoryProductRepository.find({ where: { name: Like(`%${name}%`) } });

      if (!product && !category) {
        res.status(404).json({ success: false, message: "No products found" });
        return;
      }

      res.status(200).json({ success: true, product, category });
    } catch (err: unknown) {
      const error = err as CustomError;

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.status(error.statusCode).json({ error: error });
    }
  };
}
