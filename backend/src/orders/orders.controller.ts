import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Order } from './entities/order.entity';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':bookingId')
  @Roles(UserRole.ADMIN)
  async create(@Param('bookingId') bookingId: string): Promise<Order> {
    return this.ordersService.createFromBooking(bookingId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  async findAll(@GetUser() user: User): Promise<Order[]> {
    if (user.role === UserRole.ADMIN) {
      return this.ordersService.findAll();
    }
    return this.ordersService.findAllByEmployee(user.id);
  }

  @Get('employee/:userId')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  async findAllByEmployee(
    @Param('userId') userId: string,
    @GetUser() user: User
  ): Promise<Order[]> {
    // Only allow admin or the employee themselves to access their orders
    if (user.role !== UserRole.ADMIN && user.id !== userId) {
      throw new UnauthorizedException('Du har ikke tilgang til å se disse ordrene');
    }
    return this.ordersService.findAllByEmployee(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User
  ): Promise<Order> {
    if (user.role === UserRole.ADMIN) {
      return this.ordersService.findOne(id);
    }
    return this.ordersService.findOneByEmployee(id, user.id);
  }
}
