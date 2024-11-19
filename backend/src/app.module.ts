import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { databaseConfig, cacheConfig, jwtConfig } from "./config";

// Feature Modules
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EmployeesModule } from "./employees/employees.module";
import { ServicesModule } from "./services/services.module";
import { BookingsModule } from "./bookings/bookings.module";

// Entities
import { User } from "./users/entities/user.entity";
import { Employee } from "./employees/entities/employee.entity";
import { Service } from "./services/entities/service.entity";
import { Booking } from "./bookings/entities/booking.entity";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cacheConfig, jwtConfig],
      envFilePath: ".env",
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get("database"),
        entities: [User, Employee, Service, Booking],
      }),
    }),

    // Cache
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    EmployeesModule,
    ServicesModule,
    BookingsModule,
  ],
})
export class AppModule {}
