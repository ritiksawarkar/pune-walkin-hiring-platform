package com.punewalkin.platform.database;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

public class FlywayMigrationValidationTest {

    private static final Logger log = LoggerFactory.getLogger(FlywayMigrationValidationTest.class);

    @Test
    @DisplayName("Verify Flyway V1 and V2 migrations execute successfully and idempotently in MySQL mode")
    void testFlywayMigrationsCompleteSuccessfully() throws Exception {
        String jdbcUrl = "jdbc:h2:mem:flyway_test_db;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE";
        String user = "sa";
        String password = "";

        Flyway flyway = Flyway.configure()
                .dataSource(jdbcUrl, user, password)
                .locations("classpath:db/migration")
                .cleanDisabled(false)
                .load();

        log.info("Executing Flyway migrate on clean test database...");
        MigrateResult result = flyway.migrate();

        log.info("Flyway migration completed successfully. Migrations executed: {}, target schema version: {}",
                result.migrationsExecuted, result.targetSchemaVersion);
        assertEquals(4, result.migrationsExecuted, "Expected 4 migrations (V1, V2, V3, and V4) to execute");
        assertTrue(result.success, "Flyway migration should succeed");
        assertEquals("4", result.targetSchemaVersion, "Target schema version should be 4");

        // Verify seeded data in notifications table
        try (Connection conn = DriverManager.getConnection(jdbcUrl, user, password);
             Statement stmt = conn.createStatement()) {

            // Check notifications count
            try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM notifications")) {
                assertTrue(rs.next());
                int count = rs.getInt(1);
                log.info("Total notifications seeded: {}", count);
                assertEquals(4, count, "Expected 4 demo notifications seeded");
            }

            // Verify a specific notification has title and message matching V2
            try (ResultSet rs = stmt.executeQuery("SELECT title, message FROM notifications WHERE id = 'notif-01'")) {
                assertTrue(rs.next());
                assertEquals("Application Shortlisted!", rs.getString("title"));
            }

            // Verify users, companies, drives, applications counts
            try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM users")) {
                assertTrue(rs.next());
                assertEquals(7, rs.getInt(1), "Expected 7 demo users");
            }
            try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM walk_in_drives")) {
                assertTrue(rs.next());
                assertEquals(4, rs.getInt(1), "Expected 4 walk-in drives");
            }
        }

        // Test idempotency: re-running migrate should not fail
        MigrateResult secondRun = flyway.migrate();
        log.info("Second migration run executed {} migrations", secondRun.migrationsExecuted);
        assertEquals(0, secondRun.migrationsExecuted, "No pending migrations should remain");
    }
}
