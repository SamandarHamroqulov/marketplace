import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MailModule } from './modules/mail/mail.module';
import { AddressModule } from './modules/address/address.module';
import { User } from './modules/user/entities/user.entity';
import { Product } from './modules/product/entities/product.entity';
import { Category } from './modules/category/entities/category.entity';
import { Address } from './modules/address/entities/address.entity';
import { Cart } from './modules/cart/entities/cart.entity';
import { Order } from './modules/orders/entities/order.entity';
import { Review } from './modules/reviews/entities/review.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
        }),
      }),
    }),
    ConfigModule.forRoot({
    envFilePath: ".env",
    isGlobal: true
  }), TypeOrmModule.forRoot({
    type: "postgres",
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
    autoLoadEntities: true,
    synchronize: true,
    entities: [User, Product, Category, Address, Cart, Order, Review]

  }), UserModule, AuthModule, OrdersModule, ProductModule, CategoryModule, CartModule, ReviewsModule, MailModule, AddressModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
