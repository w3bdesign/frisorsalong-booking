import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShopCode } from "./entities/shop-code.entity";

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(ShopCode)
    private readonly shopCodeRepository: Repository<ShopCode>
  ) {}

  async validateShopCode(code: string): Promise<ShopCode> {
    const shopCode = await this.shopCodeRepository.findOne({
      where: { code, isActive: true },
    });

    if (!shopCode) {
      throw new UnauthorizedException("Invalid shop code");
    }

    // Check rate limiting
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Reset counter if it's a new day
    if (!shopCode.lastBookingTime || shopCode.lastBookingTime < startOfDay) {
      shopCode.todayBookingCount = 0;
    }

    // Check if daily limit is reached
    if (shopCode.todayBookingCount >= shopCode.dailyBookingLimit) {
      throw new UnauthorizedException("Daily booking limit reached");
    }

    // Update booking count and time
    shopCode.todayBookingCount++;
    shopCode.lastBookingTime = now;
    await this.shopCodeRepository.save(shopCode);

    return shopCode;
  }

  async createShopCode(shopName: string, code?: string): Promise<ShopCode> {
    // Generate a random code if none provided
    const shopCode =
      code || Math.random().toString(36).substring(2, 8).toUpperCase();

    const newShopCode = this.shopCodeRepository.create({
      code: shopCode,
      shopName,
    });

    return this.shopCodeRepository.save(newShopCode);
  }

  async deactivateShopCode(code: string): Promise<void> {
    await this.shopCodeRepository.update({ code }, { isActive: false });
  }

  async updateDailyLimit(code: string, limit: number): Promise<void> {
    await this.shopCodeRepository.update(
      { code },
      { dailyBookingLimit: limit }
    );
  }
}
