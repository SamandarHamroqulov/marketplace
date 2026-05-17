import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MailModule } from './modules/mail/mail.module';
import { AddressModule } from './modules/address/address.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
          },
        }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('db.user'),
        password: configService.get<string>('db.pass'),
        database: configService.get<string>('db.name'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('nodeEnv') !== 'production',
      }),
    }),
    HealthModule,
    UserModule,
    AuthModule,
    OrdersModule,
    ProductModule,
    CategoryModule,
    CartModule,
    ReviewsModule,
    MailModule,
    AddressModule,
    WishlistModule,
  ],
})
export class AppModule {}
