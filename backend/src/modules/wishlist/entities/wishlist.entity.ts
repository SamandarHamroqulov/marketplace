import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('wishlists')
@Unique(['user', 'product'])
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
