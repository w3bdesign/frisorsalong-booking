import { DataSource, Repository } from 'typeorm';
import { CreateServicesSeed } from './create-services.seed';
import { Service } from '../../services/entities/service.entity';

describe('CreateServicesSeed', () => {
  let seed: CreateServicesSeed;
  let mockDataSource: Partial<DataSource>;
  let mockServiceRepository: Partial<Repository<Service>>;

  beforeEach(() => {
    mockServiceRepository = {
      clear: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockServiceRepository),
    };

    seed = new CreateServicesSeed();
  });

  it('should clear existing services and create new ones', async () => {
    // Mock clear to resolve successfully
    (mockServiceRepository.clear as jest.Mock).mockResolvedValue(undefined);
    
    // Mock save to return the services with proper typing
    (mockServiceRepository.save as jest.Mock).mockImplementation((services: Service[]): Promise<Service[]> => {
      return Promise.resolve(services.map(service => ({
        ...service,
        id: expect.any(String), // Add expected id property
        createdAt: expect.any(Date), // Add expected timestamps
        updatedAt: expect.any(Date),
      })));
    });

    await seed.run(mockDataSource as DataSource);

    // Verify clear was called
    expect(mockServiceRepository.clear).toHaveBeenCalled();

    // Verify save was called with all services
    expect(mockServiceRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Standard Klipp',
        description: expect.any(String),
        duration: 20,
        price: 299,
        isActive: true,
      }),
      expect.objectContaining({
        name: 'Styling Klipp',
        description: expect.any(String),
        duration: 30,
        price: 399,
        isActive: true,
      }),
      expect.objectContaining({
        name: 'Skjegg Trim',
        description: expect.any(String),
        duration: 15,
        price: 199,
        isActive: true,
      }),
      expect.objectContaining({
        name: 'Full Service',
        description: expect.any(String),
        duration: 45,
        price: 549,
        isActive: true,
      })
    ]);
  });

  it('should handle database errors gracefully', async () => {
    const dbError = new Error('Database connection error');
    (mockServiceRepository.clear as jest.Mock).mockRejectedValue(dbError);

    await expect(seed.run(mockDataSource as DataSource)).rejects.toThrow('Database connection error');
  });
});
