import { DataSource } from 'typeorm';
import { Seeder } from './seeder.interface';
import { Service } from '../../services/entities/service.entity';

export class CreateServicesSeed implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const serviceRepository = dataSource.getRepository(Service);

    const services = [
      {
        name: 'Standard Klipp',
        description: 'En standard og effektiv hårklipp for deg som har det travelt. Perfekt for å vedlikeholde din nåværende stil.',
        duration: 20,
        price: 299,
      },
      {
        name: 'Styling Klipp',
        description: 'Komplett hårklipp og styling-service. Inkluderer konsultasjon for å finne det perfekte utseendet.',
        duration: 30,
        price: 399,
      },
      {
        name: 'Skjegg Trim',
        description: 'Profesjonell skjeggtrimming og forming for å holde skjegget ditt velstelt.',
        duration: 15,
        price: 199,
      },
      {
        name: 'Full Service',
        description: 'Komplett pakke som inkluderer hårklipp, skjeggtrim og styling. Vår premium-tjeneste.',
        duration: 45,
        price: 549,
      },
    ];

    for (const service of services) {
      const existingService = await serviceRepository.findOne({
        where: { name: service.name },
      });

      if (!existingService) {
        await serviceRepository.save(service);
      }
    }
  }
}
