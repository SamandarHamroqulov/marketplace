import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  addressLine: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
