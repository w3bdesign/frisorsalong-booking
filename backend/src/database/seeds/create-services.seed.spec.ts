import { DataSource, Repository } from 'typeorm';
import { CreateServicesSeed } from './create-services.seed';
import { Service } from '../../services/entities/service.entity';

describe('CreateServicesSeed', () => {
  let seed: CreateServicesSeed;
  let mockDataSource: Partial<DataSource>;
  let mockServiceRepository: Partial<Repository<Service>>;

  beforeEach(() => {
    mockServiceRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockServiceRepository),
    };

    seed = new CreateServicesSeed();
  });

  it('should create services if they do not exist', async () => {
    // Mock findOne to return null (service doesn't exist)
    (mockServiceRepository.findOne as jest.Mock).mockResolvedValue(null);

    await seed.run(mockDataSource as DataSource);

    // Should try to find each service
    expect(mockServiceRepository.findOne).toHaveBeenCalledTimes(4);

    // Verify save was called for each service
    expect(mockServiceRepository.save).toHaveBeenCalledTimes(4);

    // Verify the correct services were saved
    expect(mockServiceRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Standard Klipp',
        description: expect.any(String),
        duration: 20,
        price: 299,
      })
    );

    expect(mockServiceRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Styling Klipp',
        description: expect.any(String),
        duration: 30,
        price: 399,
      })
    );

    expect(mockServiceRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Skjegg Trim',
        description: expect.any(String),
        duration: 15,
        price: 199,
      })
    );

    expect(mockServiceRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Full Service',
        description: expect.any(String),
        duration: 45,
        price: 549,
      })
    );
  });

  it('should not create services that already exist', async () => {
    // Mock findOne to return an existing service
    (mockServiceRepository.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Standard Klipp',
      description: 'Existing service',
      duration: 20,
      price: 299,
    });

    await seed.run(mockDataSource as DataSource);

    // Should try to find each service
    expect(mockServiceRepository.findOne).toHaveBeenCalledTimes(4);

    // Should not save any services since they all exist
    expect(mockServiceRepository.save).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    // Mock findOne to throw an error
    const dbError = new Error('Database connection error');
    (mockServiceRepository.findOne as jest.Mock).mockRejectedValue(dbError);

    await expect(seed.run(mockDataSource as DataSource)).rejects.toThrow(dbError);
  });
});
