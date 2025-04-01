import { CartEntity, CartItemsEntity, OrderEntity, OrderItemEntity } from "@entities";
import { InitRepository, InjectRepositories } from "@helpers";
import { TRequest, TResponse } from "@types";
import { In, Repository } from "typeorm";

interface CustomError extends Error {
  statusCode?: number;
}

export class OrderController {
  @InitRepository(OrderItemEntity)
  orderItemRepository: Repository<OrderItemEntity>;

  @InitRepository(OrderEntity)
  orderRepository: Repository<OrderEntity>;

  @InitRepository(CartEntity)
  cartRepository: Repository<CartEntity>;

  @InitRepository(CartItemsEntity)
  cartitemsRepository: Repository<CartItemsEntity>;

  constructor() {
    InjectRepositories(this);
  }
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
      res.status(error.statusCode).json({ error: error });
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
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      res.status(error.statusCode).json({ error: error });
    }
  };

  //get order details and status
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
      res.status(error.statusCode).json({ error: error });
    }
  };
}
