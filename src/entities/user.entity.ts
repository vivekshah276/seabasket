import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  phone: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  password: string;

  @Column({ type: "varchar", nullable: true, default: null })
  resetToken: string | null;

  @Column({ type: "timestamp", nullable: true, default: null })
  resetTokenExpiration: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
