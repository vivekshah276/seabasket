import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("cart")
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:"int"})
  userId: number;

  @OneToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;  

  @UpdateDateColumn()
  updatedAt: Date;
}
