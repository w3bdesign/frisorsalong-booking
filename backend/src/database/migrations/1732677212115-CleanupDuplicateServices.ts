import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanupDuplicateServices1732677212115 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, delete all records from employee_services junction table
        await queryRunner.query(`DELETE FROM "employee_services"`);

        // Use a CTE to identify the services we want to keep (one of each type)
        await queryRunner.query(`
            WITH ranked_services AS (
                SELECT id,
                       name,
                       ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
                FROM services
            ),
            services_to_delete AS (
                SELECT id
                FROM ranked_services
                WHERE rn > 1
            )
            DELETE FROM services
            WHERE id IN (SELECT id FROM services_to_delete);
        `);

        // Now update the remaining services to ensure they have the correct data
        await queryRunner.query(`
            UPDATE services
            SET description = CASE name
                    WHEN 'Standard Klipp' THEN 'En standard og effektiv hårklipp for deg som har det travelt. Perfekt for å vedlikeholde din nåværende stil.'
                    WHEN 'Styling Klipp' THEN 'Komplett hårklipp og styling-service. Inkluderer konsultasjon for å finne det perfekte utseendet.'
                    WHEN 'Skjegg Trim' THEN 'Profesjonell skjeggtrimming og forming for å holde skjegget ditt velstelt.'
                    WHEN 'Full Service' THEN 'Komplett pakke som inkluderer hårklipp, skjeggtrim og styling. Vår premium-tjeneste.'
                END,
                duration = CASE name
                    WHEN 'Standard Klipp' THEN 20
                    WHEN 'Styling Klipp' THEN 30
                    WHEN 'Skjegg Trim' THEN 15
                    WHEN 'Full Service' THEN 45
                END,
                price = CASE name
                    WHEN 'Standard Klipp' THEN 299.00
                    WHEN 'Styling Klipp' THEN 399.00
                    WHEN 'Skjegg Trim' THEN 199.00
                    WHEN 'Full Service' THEN 549.00
                END,
                is_active = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE name IN ('Standard Klipp', 'Styling Klipp', 'Skjegg Trim', 'Full Service');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down migration needed as we don't want to restore duplicates
    }
}
