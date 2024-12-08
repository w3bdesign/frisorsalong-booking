import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe("root", () => {
    it('should return API information', () => {
      expect(appController.getInfo()).toBe("Hello World!");
      expect(appService.getHello).toHaveBeenCalled();
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
