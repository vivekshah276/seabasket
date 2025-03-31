import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn } from "typeorm";
import { ProductEntity } from "./products.entity";
import { CartEntity } from "./cart.entity";

@Entity("cart_items")
export class CartItemsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: "int", nullable:false})
  quantity: number;

  @Column({type:"int"})
  productId: number;

  @Column({type:"int"})
  cartId: number;

  @ManyToOne(() => ProductEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @ManyToOne(() => CartEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cartId" })
  cart: CartEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
