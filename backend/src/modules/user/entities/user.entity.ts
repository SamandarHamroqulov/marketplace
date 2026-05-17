import { Role } from 'src/common/enums/role.enum';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string


  @Column()
  fullName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Exclude()
  @Column({
    nullable: true,
  })
  verificationCode: string;

  @Exclude()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verificationCodeExpires: Date;

  @Column({
    default: false,
  })
  isVerified: boolean;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  hashedRefreshToken: string | null;

  @Column({
    default: 0,
  })
  resendCount: number;

  @OneToMany(() => Product, (product) => product.owner)
  products: Product[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
