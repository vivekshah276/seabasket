import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { CategoryProductEntity } from "./category_products.entity";

@Entity("products")
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "float", nullable: false })
  price: number;

  @Column({ type: "float", nullable: true })
  rating: number | null;

  @Column({ type: "float", nullable: true })
  discount: number | null;

  @Column({ type: "int", nullable: false })
  userId: number; 

  @Column({ type: "int", nullable: false })
  categoryId: number; 

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @ManyToOne(() => CategoryProductEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "categoryId" })
  category: CategoryProductEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
