import { Category } from 'src/modules/category/entities/category.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';


@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal')
  price: number;

  @Column({
    default: 0,
  })
  quantity: number;

  @Column({
    default: true,
  })
  inStock: boolean;

  @Column({ nullable: true })
  brand: string;

  @Column('decimal', { nullable: true })
  compareAtPrice: number;

  @Column('jsonb', { nullable: true })
  colors: string[];

  @Column('jsonb', { nullable: true })
  storageOptions: string[];

  @Column('jsonb', { nullable: true })
  specs: Record<string, string>;

  @Column('jsonb', { nullable: true })
  detailSpecs: Record<string, Record<string, string>>;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
  })
  images: ProductImage[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;
}