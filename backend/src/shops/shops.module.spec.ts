import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopsModule } from './shops.module';
import { ShopsService } from './shops.service';
import { ShopCode } from './entities/shop-code.entity';

describe('ShopsModule', () => {
  let module: ShopsModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ShopsModule],
    })
      .overrideProvider(getRepositoryToken(ShopCode))
      .useValue({})
      .compile();

    module = moduleRef.get<ShopsModule>(ShopsModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export ShopsService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ShopsModule],
    })
      .overrideProvider(getRepositoryToken(ShopCode))
      .useValue({})
      .compile();

    const shopsService = moduleRef.get<ShopsService>(ShopsService);
    expect(shopsService).toBeDefined();
  });
});
