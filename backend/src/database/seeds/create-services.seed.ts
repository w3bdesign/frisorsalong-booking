import { DataSource } from 'typeorm';
import { Seeder } from './seeder.interface';
import { Service } from '../../services/entities/service.entity';

export class CreateServicesSeed implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const serviceRepository = dataSource.getRepository(Service);

    // First, clear any existing services to prevent duplicates
    await serviceRepository.clear();

    const services = [
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

    // Save all services at once
    await serviceRepository.save(services);
  }
}
