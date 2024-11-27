import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShopsService } from "./shops.service";
import { ShopCode } from "./entities/shop-code.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ShopCode])],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
