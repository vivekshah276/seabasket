import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { UserEntity } from "./user.entity";
import { OrderItemEntity } from "./orderItems.entity";
import { enums } from "@types";

@Entity("orders")
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "float", nullable: false })
  totalAmount: number;

  @Column({ type: "boolean", default: false })
  isCancelled: boolean;

  @Column({
    type: "enum",
    enum: enums.OrderStatus,
    default: enums.OrderStatus.Pending,
  })
  status: string;

  @OneToMany(() => OrderItemEntity, orderItem => orderItem.order)
  orderItems: OrderItemEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
