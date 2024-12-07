import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ShopsService } from "../shops.service";
import { Request } from "express";
import { ShopCode } from "../entities/shop-code.entity";

// Extend Express Request to include shop property
interface RequestWithShop extends Request {
  shop?: ShopCode;
}

@Injectable()
export class ShopCodeGuard implements CanActivate {
  constructor(private readonly shopsService: ShopsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithShop>();
    const shopCode = this.getShopCodeFromHeaders(request);

    if (!shopCode) {
      throw new UnauthorizedException("Shop code is required");
    }

    try {
      // Validate shop code and check rate limits
      const shop = await this.shopsService.validateShopCode(shopCode);

      // Add shop info to request for use in controllers
      request.shop = shop;

      return true;
    } catch (error) {
      // Ensure error is an Error object
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException("Invalid shop code");
    }
  }

  private getShopCodeFromHeaders(request: RequestWithShop): string | undefined {
    const header = request.headers["x-shop-code"];
    if (Array.isArray(header)) {
      return header[0];
    }
    return header;
  }
}
