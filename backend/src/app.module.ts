import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BookingsModule } from "./bookings/bookings.module";
import { EmployeesModule } from "./employees/employees.module";
import { ServicesModule } from "./services/services.module";
import { OrdersModule } from "./orders/orders.module";
import { ShopsModule } from "./shops/shops.module";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("DATABASE_URL"),
        entities: [join(__dirname, "**", "*.entity{.ts,.js}")],
        synchronize: false,
        logging: configService.get("NODE_ENV") === "development",
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    BookingsModule,
    EmployeesModule,
    ServicesModule,
    OrdersModule,
    ShopsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
