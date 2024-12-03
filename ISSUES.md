// Mock @nestjs/typeorm

jest.mock("@nestjs/typeorm", () => {

  return {

    TypeOrmModule: {

      forRootAsync: jest.fn().mockReturnValue({

        module: class
 MockTypeOrmModule {},

Unexpected empty class.

      }),

      forFeature: jest.fn().mockReturnValue({

        module: class MockTypeOrmFeatureModule {},

      }),

    },

--------------------------------------------------------------------------

const mockShopCodeRepository = {

  ...mockRepository,

  findOne: jest.fn().mockResolvedValue({ code: "TEST123" }),

};

// Mock @nestjs/typeorm

jest.mock("@nestjs/typeorm", () => {

  return {

    TypeOrmModule: {

      forRootAsync: jest.fn().mockReturnValue({

        module: class MockTypeOrmModule {},

      }),

      forFeature: jest.fn().mockReturnValue({

        module: class
 MockTypeOrmFeatureModule {},

Unexpected empty class.

      }),

    },

    getRepositoryToken: jest.fn((entity) => {

      if (entity === ShopCode) {

        return "SHOP_CODE_REPOSITORY";

      }

      return "MockRepository";

    }),

    InjectRepository: jest.fn().mockReturnValue(() => mockRepository),

  };

});

------------------------------------------------------------------------

    getRepositoryToken: jest.fn((entity) => {

      if (entity === ShopCode) {

        return "SHOP_CODE_REPOSITORY";

      }

      return "MockRepository";

    }),

    InjectRepository: jest.fn().mockReturnValue(() => mockRepository),

  };

});

// Mock feature modules

jest.mock("./auth/auth.module", () => ({

  AuthModule: class
 MockAuthModule {},

Unexpected empty class.

}));

// Mock feature modules

jest.mock("./auth/auth.module", () => ({

  AuthModule: class MockAuthModule {},

}));

jest.mock("./users/users.module", () => ({

  UsersModule: class
 MockUsersModule {},

Unexpected empty class.

}));

jest.mock("./employees/employees.module", () => ({

  EmployeesModule: class MockEmployeesModule {},

}));

jest.mock("./services/services.module", () => ({

  ServicesModule: class MockServicesModule {},

}));

jest.mock("./bookings/bookings.module", () => ({

  BookingsModule: class MockBookingsModule {},

}));

jest.mock("./orders/orders.module", () => ({

  OrdersModule: class MockOrdersModule {},

}));

jest.mock("./shops/shops.module", () => ({

  ShopsModule: class MockShopsModule {},

    configService
 = moduleRef.get<ConfigService>(ConfigService);

Remove this useless assignment to variable "configService".

backend/src/auth/auth.module.spec.ts
See all issues in this file

import { Test
 } from '@nestjs/testing';

Remove this unused import of 'Test'.

export class RolesGuard implements CanActivate {

  constructor(private
 reflector: Reflector) {}

Member 'reflector: Reflector' is never reassigned; mark it as `readonly`.

