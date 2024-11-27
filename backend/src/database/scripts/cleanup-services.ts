import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Service } from '../../services/entities/service.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Order } from '../../orders/entities/order.entity';

config();

const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [Service, Employee, User, Booking, Order],
    synchronize: false,
    ssl: {
        rejectUnauthorized: false
    }
});

async function cleanupServices() {
    try {
        await dataSource.initialize();
        console.log("Connected to database");

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();

        // Start transaction
        await queryRunner.startTransaction();

        try {
            console.log("Starting cleanup...");

            // First, delete all records from employee_services junction table
            await queryRunner.query(`DELETE FROM "employee_services"`);
            console.log("Cleared employee_services junction table");

            // Get services grouped by name, keeping the oldest one of each type
            const servicesResult = await queryRunner.query(`
                WITH ranked_services AS (
                    SELECT id,
                           name,
                           ROW_NUMBER() OVER (PARTITION BY name ORDER BY "createdAt") as rn
                    FROM services
                )
                SELECT id as keep_id, name
                FROM ranked_services
                WHERE rn = 1;
            `);
            console.log("Found services to keep:", servicesResult);

            // For each service type, update bookings to point to the service we're keeping
            for (const service of servicesResult) {
                await queryRunner.query(`
                    WITH duplicate_services AS (
                        SELECT s.id
                        FROM services s
                        WHERE s.name = $1 AND s.id != $2
                    )
                    UPDATE bookings
                    SET service_id = $2
                    WHERE service_id IN (SELECT id FROM duplicate_services);
                `, [service.name, service.keep_id]);
                console.log(`Updated bookings for ${service.name}`);
            }

            // Now we can safely delete the duplicate services
            const deleteResult = await queryRunner.query(`
                WITH ranked_services AS (
                    SELECT id,
                           name,
                           ROW_NUMBER() OVER (PARTITION BY name ORDER BY "createdAt") as rn
                    FROM services
                )
                DELETE FROM services
                WHERE id IN (
                    SELECT id
                    FROM ranked_services
                    WHERE rn > 1
                )
                RETURNING id;
            `);
            console.log(`Deleted ${deleteResult.length} duplicate services`);

            // Update the remaining services
            const updateResult = await queryRunner.query(`
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
                    "isActive" = true,
                    "updatedAt" = CURRENT_TIMESTAMP
                WHERE name IN ('Standard Klipp', 'Styling Klipp', 'Skjegg Trim', 'Full Service')
                RETURNING id, name;
            `);
            console.log(`Updated ${updateResult.length} services`);

            // Commit transaction
            await queryRunner.commitTransaction();
            console.log("Successfully cleaned up services");

        } catch (err) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            console.error("Error cleaning up services:", err);
            throw err;
        } finally {
            // Release query runner
            await queryRunner.release();
        }

    } catch (err) {
        console.error("Error:", err);
        throw err;
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

cleanupServices()
    .then(() => {
        console.log("Cleanup completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Cleanup failed:", error);
        process.exit(1);
    });
