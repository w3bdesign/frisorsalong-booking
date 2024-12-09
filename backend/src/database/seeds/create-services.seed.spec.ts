import { DataSource } from 'typeorm';
import { CreateServicesSeed } from './create-services.seed';
import { Service } from '../../services/entities/service.entity';

interface MockServiceRepository {
  clear: jest.Mock<Promise<void>, []>;
  save: jest.Mock<Promise<Service[]>, [Service[]]>;
}

type ServiceData = Pick<Service, 'name' | 'description' | 'duration' | 'price' | 'isActive'>;

const expectedServices: ServiceData[] = [
  {
    name: 'Standard Klipp',
    description: 'En standard og effektiv hårklipp for deg som har det travelt. Perfekt for å vedlikeholde din nåværende stil.',
    duration: 20,
    price: 299,
    isActive: true,
  },
  {
    name: 'Styling Klipp',
    description: 'Komplett hårklipp og styling-service. Inkluderer konsultasjon for å finne det perfekte utseendet.',
    duration: 30,
    price: 399,
    isActive: true,
  },
  {
    name: 'Skjegg Trim',
    description: 'Profesjonell skjeggtrimming og forming for å holde skjegget ditt velstelt.',
    duration: 15,
    price: 199,
    isActive: true,
  },
  {
    name: 'Full Service',
    description: 'Komplett pakke som inkluderer hårklipp, skjeggtrim og styling. Vår premium-tjeneste.',
    duration: 45,
    price: 549,
    isActive: true,
  }
];

describe('CreateServicesSeed', () => {
  let seed: CreateServicesSeed;
  let mockDataSource: Partial<DataSource>;
  let mockServiceRepository: MockServiceRepository;

  beforeEach(() => {
    mockServiceRepository = {
      clear: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
      save: jest.fn<Promise<Service[]>, [Service[]]>().mockImplementation((services: Service[]): Promise<Service[]> => {
        return Promise.resolve(
          services.map(service => ({
            ...service,
            id: 'test-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        );
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

    expectedServices.forEach((expectedService, index) => {
      expect(savedServices[index]).toEqual(
        expect.objectContaining(expectedService)
      );
    });
  });

  it('should handle database errors gracefully', async () => {
    const dbError = new Error('Database connection error');
    mockServiceRepository.clear.mockRejectedValue(dbError);

    await expect(seed.run(mockDataSource as DataSource)).rejects.toThrow('Database connection error');
  });
});
