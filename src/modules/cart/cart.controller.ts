import { CartEntity, CartItemsEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { Repository } from "typeorm";

interface CustomError extends Error {
  statusCode?: number;
}

export class CartController {
  @InitRepository(CartItemsEntity)
  cartitemsRepository: Repository<CartItemsEntity>;

  @InitRepository(CartEntity)
  cartRepository: Repository<CartEntity>;

  constructor() {
    InjectRepositories(this);
  }
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
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
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
        res.status(404).json({ message: "No Cart Found" });
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
        res.status(404).json({ message: "No Product Found" });
        return;
      }

      res.status(200).json({ success: true, cart, cartItems });
    } catch (err: unknown) {
      const error = err as CustomError;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
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
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
    }
  };
}
