import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue("Hello World!"),
          },
        },
      ],
    }).compile();

    // Use type assertion here since we know these types are correct
    // based on our module configuration
    appController = module.get(AppController);
    appService = module.get(AppService);

    // Verify the instances are correct
    if (!(appController instanceof AppController)) {
      throw new Error('Failed to get AppController instance');
    }
    if (typeof appService.getHello !== 'function') {
      throw new Error('Invalid AppService instance: getHello method not found');
    }
  });

  describe("root", () => {
    it('should return API information', () => {
      const mockGetHello = jest.spyOn(appService, 'getHello');
      expect(appController.getInfo()).toBe("Hello World!");
      expect(mockGetHello).toHaveBeenCalled();
    });
  });

  describe("docs", () => {
    it('should have a docs endpoint that redirects', () => {
      const result = appController.getDocs();
      expect(result).toBeUndefined();
    });
  });

  describe("health", () => {
    it('should return ok status', () => {
      expect(appController.healthCheck()).toEqual({ status: 'ok' });
    });
  });
});
