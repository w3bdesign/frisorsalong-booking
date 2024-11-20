import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateServices1732142680425 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, delete all records from employee_services junction table
        await queryRunner.query(`DELETE FROM "employee_services"`);
        
        // Then, delete all records from services table
        await queryRunner.query(`DELETE FROM "services"`);

        // Insert new Norwegian services
        await queryRunner.query(`
            INSERT INTO "services" ("name", "description", "duration", "price", "isActive")
            VALUES 
            ('Standard Klipp', 'En standard og effektiv hårklipp for deg som har det travelt. Perfekt for å vedlikeholde din nåværende stil.', 20, 299.00, true),
            ('Styling Klipp', 'Komplett hårklipp og styling-service. Inkluderer konsultasjon for å finne det perfekte utseendet.', 30, 399.00, true),
            ('Skjegg Trim', 'Profesjonell skjeggtrimming og forming for å holde skjegget ditt velstelt.', 15, 199.00, true),
            ('Full Service', 'Komplett pakke som inkluderer hårklipp, skjeggtrim og styling. Vår premium-tjeneste.', 45, 549.00, true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete the Norwegian services
        await queryRunner.query(`DELETE FROM "services" WHERE "name" IN ('Standard Klipp', 'Styling Klipp', 'Skjegg Trim', 'Full Service')`);
    }
}
