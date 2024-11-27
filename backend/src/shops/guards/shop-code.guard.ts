import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ShopsService } from "../shops.service";

@Injectable()
export class ShopCodeGuard implements CanActivate {
  constructor(private readonly shopsService: ShopsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const shopCode = request.headers["x-shop-code"];

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
      throw new UnauthorizedException(error.message);
    }
  }
}
