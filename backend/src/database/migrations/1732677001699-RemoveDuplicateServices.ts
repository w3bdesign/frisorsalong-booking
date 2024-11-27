import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDuplicateServices1732677001699 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, delete all records from employee_services junction table
        await queryRunner.query(`DELETE FROM "employee_services"`);
        
        // Then, delete all records from services table
        await queryRunner.query(`DELETE FROM "services"`);

        // Insert only one instance of each service
        await queryRunner.query(`
            INSERT INTO "services" ("name", "description", "duration", "price", "isActive", "createdAt", "updatedAt")
            VALUES 
            (
                'Standard Klipp',
                'En standard og effektiv hårklipp for deg som har det travelt. Perfekt for å vedlikeholde din nåværende stil.',
                20,
                299.00,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            ),
            (
                'Styling Klipp',
                'Komplett hårklipp og styling-service. Inkluderer konsultasjon for å finne det perfekte utseendet.',
                30,
                399.00,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            ),
            (
                'Skjegg Trim',
                'Profesjonell skjeggtrimming og forming for å holde skjegget ditt velstelt.',
                15,
                199.00,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            ),
            (
                'Full Service',
                'Komplett pakke som inkluderer hårklipp, skjeggtrim og styling. Vår premium-tjeneste.',
                45,
                549.00,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // In down migration, we'll just clear the services
        await queryRunner.query(`DELETE FROM "employee_services"`);
        await queryRunner.query(`DELETE FROM "services"`);
    }
}
