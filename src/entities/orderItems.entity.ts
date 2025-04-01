import { 
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn 
} from "typeorm";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "./products.entity";

@Entity("order_items")
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:"int"})
  orderId: number; 

  @Column({type:"int"})
  productId: number;

  @Column({type:"int"})
  quantity: number;

  @Column("float")
  price: number;

  @ManyToOne(() => OrderEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
