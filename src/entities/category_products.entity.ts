import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn 
} from "typeorm";

@Entity("category_products")
export class CategoryProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:"varchar", nullable:false})
  name: string;

  @Column({type:"varchar", nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
