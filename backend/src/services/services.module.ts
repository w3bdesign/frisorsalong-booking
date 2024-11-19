import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Service } from "./entities/service.entity";
import { ServicesService } from "./services.service";

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  providers: [ServicesService],
  exports: [ServicesService, TypeOrmModule],
})
export class ServicesModule {}
