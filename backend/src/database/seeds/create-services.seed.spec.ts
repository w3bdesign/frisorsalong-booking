import { DataSource, Repository } from 'typeorm';
import { CreateServicesSeed } from './create-services.seed';
import { Service } from '../../services/entities/service.entity';

interface MockServiceRepository extends Partial<Repository<Service>> {
  clear: jest.Mock<Promise<void>>;
  save: jest.Mock<Promise<Service[]>, [Service[]]>;
}

describe('CreateServicesSeed', () => {
  let seed: CreateServicesSeed;
  let mockDataSource: Partial<DataSource>;
  let mockServiceRepository: MockServiceRepository;

  beforeEach(() => {
    mockServiceRepository = {
      clear: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
      save: jest.fn<Promise<Service[]>, [Service[]]>().mockImplementation((services: Service[]): Promise<Service[]> => {
        return Promise.resolve(services.map(service => ({
          ...service,
          id: 'test-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        })));
      }),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockServiceRepository),
    };

    seed = new CreateServicesSeed();
  });

  it('should clear existing services and create new ones', async () => {
    await seed.run(mockDataSource as DataSource);

    expect(mockServiceRepository.clear).toHaveBeenCalled();

    const savedServices = mockServiceRepository.save.mock.calls[0][0];
    expect(savedServices).toEqual([
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
    mockServiceRepository.clear.mockRejectedValue(dbError);

    await expect(seed.run(mockDataSource as DataSource)).rejects.toThrow('Database connection error');
  });
});
