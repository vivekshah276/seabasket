import { CartEntity, CartItemsEntity, CategoryProductEntity, OrderEntity, OrderItemEntity, ProductEntity, ReviewsEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from "typeorm";
import { CategoryDto, ProductDto, ReviewsDto } from "./dto";

interface CustomError extends Error {
  statusCode?: number;
}

export class ProductController {
  @InitRepository(ProductEntity)
  productRepository: Repository<ProductEntity>;

  @InitRepository(ReviewsEntity)
  reviewsRepository: Repository<ReviewsEntity>;

  @InitRepository(OrderItemEntity)
  orderItemRepository: Repository<OrderItemEntity>;

  @InitRepository(OrderEntity)
  orderRepository: Repository<OrderEntity>;

  @InitRepository(CategoryProductEntity)
  categoryProductRepository: Repository<CategoryProductEntity>;

  @InitRepository(CartItemsEntity)
  cartitemsRepository: Repository<CartItemsEntity>;

  @InitRepository(CartEntity)
  cartRepository: Repository<CartEntity>;

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
      res.status(400).json({ error: error });
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
      res.status(400).json({ error: error });
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
      res.status(400).json({ error: error });
    }
  };

  //delete existed product
  public deleteProduct = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const prodId = req.params.productId;
      await this.productRepository.delete(prodId);
      res.status(200).json({ success: true, message: "product deleted successfully" });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(400).json({ error: error });
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
    const { name, description } = req.dto;
    try {
      const category = await this.categoryProductRepository.create(req.dto);
      this.categoryProductRepository.save(category);
      res.status(201).json({ success: true, category: category });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(400).json({ error: error });
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
      res.status(400).json({ error: error });
    }
  };

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
      error.statusCode = error.statusCode || 500;
      res.status(400).json({ error });
    }
  };

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
      res.status(400).json({ error: error });
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
        res.status(404).json({ message: "no reviews" });
        return;
      }
      res.status(200).json({ success: true, review });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(400).json({ error: error });
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
      error.statusCode = error.statusCode || 500;
      res.status(400).json({ error });
    }
  };

  // post Cart
  public postCart = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const { productId, quantity } = req.body;
      if (!productId || !quantity) {
        const error = new Error("Product and Quantity required") as CustomError;
        error.statusCode = 400;
        throw error;
      }

      // Check if the user has an active cart
      let cart = await this.cartRepository.findOne({ where: { user: { id: req.user.id } } });

      if (!cart) {
        cart = this.cartRepository.create({ user: { id: req.user.id } });
        await this.cartRepository.save(cart);
      }

      // Check if the product is already in the cart
      let cartItem = await this.cartitemsRepository.findOne({
        where: { cart: { id: cart.id }, product: { id: productId } },
      });

      if (cartItem) {
        cartItem.quantity += quantity;
      } else {
        cartItem = this.cartitemsRepository.create({
          quantity: quantity,
          productId: productId,
          cartId: cart.id,
        });
      }

      await this.cartitemsRepository.save(cartItem);

      res.status(200).json({ success: true, cartItem, message: "Product added to cart" });
    } catch (err: unknown) {
      const error = err as CustomError;
      error.statusCode = error.statusCode || 500;
      res.status(400).json({ error });
    }
  };

  // get Cart
  public getCart = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      // Find the cart for the current user
      const cart = await this.cartRepository.findOne({
        where: { userId: req.user.id },
      });
      if (!cart || cart === null) {
        res.status(404).json({ message: "No Product Found" });
        return;
      }

      // Find all cart items associated with the cart
      const cartItems = await this.cartitemsRepository.find({
        where: { cart: { id: cart.id } },
        relations: ["product"],
        select: {
          id: true,
          quantity: true,
          product: { id: true, name: true, price: true, rating: true, discount: true },
        },
      });

      if (!cartItems.length) {
        const error = new Error("No Products in Cart") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ success: true, cart, cartItems });
    } catch (err: unknown) {
      const error = err as CustomError;
      error.statusCode = error.statusCode || 500;
      res.status(400).json({ error });
    }
  };

  // create order
  public postOrder = async (req: TRequest, res: TResponse) => {
    try {
      // Find the cart for the current user
      const cart = await this.cartRepository.findOne({
        where: { userId: req.user.id },
      });
      if (!cart) {
        const error = new Error("No Cart Found") as CustomError;
        error.statusCode = 404;
        throw error;
      }
      const cartItems = await this.cartitemsRepository.find({
        where: { cart: { id: cart.id } },
        relations: ["product"],
      });

      if (!cartItems || cartItems.length === 0) {
        const error = new Error("No Products in Cart") as CustomError;
        error.statusCode = 400;
        throw error;
      }
      const order = await this.orderRepository.create({
        userId: req.user.id,
        totalAmount: cartItems.reduce((acc: number, item: any) => {
          return acc + item.quantity * item.product.price;
        }, 0),

        isCancelled: false,
        status: "Pending",
      });
      await this.orderRepository.save(order);
      const orderItems = await cartItems.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));
      await this.orderItemRepository.insert(orderItems);
      await this.cartitemsRepository.remove(cartItems);
      res.status(200).json({ success: true, order: order });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(400).json({ error: error });
    }
  };

  //remove item from cart
  public removeCartItems = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const userId = req.user.id;
      const productId = req.body.productId;

      // Find the cart associated with the user
      const cart = await this.cartRepository.findOne({ where: { userId } });
      if (!cart) {
        throw new Error("Cart not found") as CustomError;
      }

      // Find the cart item within the user's cart
      const existProduct = await this.cartitemsRepository.findOne({
        where: { cart: { id: cart.id }, product: { id: productId } },
      });

      if (!existProduct) {
        const error = new Error("There is no such item in the cart") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Remove the cart item
      await this.cartitemsRepository.remove(existProduct);

      res.status(200).json({ success: true, message: "Item removed" });
    } catch (err: unknown) {
      const error = err as CustomError;
      error.statusCode = error.statusCode || 500;
      res.status(400).json({ error });
    }
  };

  // getOrders
  public getOrder = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const orders = await this.orderRepository.find({
        where: { userId: req.user.id },
        select: ["id", "isCancelled", "status"],
      });

      if (!orders.length) {
        res.status(404).json({ message: "You haven't ordered yet!" });
        return;
      }

      const orderIds = orders.map(order => order.id);

      const orderItems = await this.orderItemRepository.find({
        where: { order: { id: In(orderIds) } },
        select: ["id", "orderId", "productId", "quantity"],
        relations: ["product"],
      });

      const formattedOrders = orders.map(order => ({
        id: order.id,
        isCancelled: order.isCancelled,
        status: order.status,
        orderItems: orderItems
          .filter(item => item.orderId === order.id)
          .map(item => ({
            productId: item.product?.id,
            quantity: item.quantity,
            price: item.product?.price,
          })),
      }));

      res.status(200).json({ success: true, orders: formattedOrders });
    } catch (err: unknown) {
      const error = err as CustomError;
      error.statusCode = error.statusCode || 500;
      res.status(400).json({ error });
    }
  };

  public orderDetails = async (req: TRequest, res: TResponse): Promise<void> => {
    try {
      const orderId = Number(req.params.orderId);
      const action = req.query.action;

      if (action === "cancel") {
        await this.orderRepository.update(orderId, { isCancelled: true, status: "Cancelled" });
      }

      const order = await this.orderRepository.findOne({ where: { id: orderId } });
      if (!order) {
        const error = new Error("No orders yet") as CustomError;
        error.statusCode = 404;
        throw error;
      }
      const orderDetails = await this.orderItemRepository.find({
        where: { order: { id: orderId } },
        select: ["productId", "quantity"],
        relations: ["product"],
      });

      const orderStatus = await this.orderRepository.findOne({
        where: { id: orderId },
        select: ["status"],
      });

      res.status(200).json({ success: true, orderDetails, orderStatus });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(400).json({ error: error });
    }
  };
}
