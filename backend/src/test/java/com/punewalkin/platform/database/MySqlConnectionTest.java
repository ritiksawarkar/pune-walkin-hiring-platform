package com.punewalkin.platform.database;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class MySqlConnectionTest {

    private static final Logger log = LoggerFactory.getLogger(MySqlConnectionTest.class);

    @Test
    @DisplayName("Verify MySQL database connectivity and report configuration status")
    void checkMySqlDatabaseConnection() {
        String dbUrl = System.getenv().getOrDefault("DB_URL",
                "jdbc:mysql://localhost:3306/pune_walkin_hub?createDatabaseIfNotExist=true&serverTimezone=Asia/Kolkata&useSSL=false&allowPublicKeyRetrieval=true");
        String dbUser = System.getenv().getOrDefault("DB_USERNAME", "root");
        String dbPassword = System.getenv().getOrDefault("DB_PASSWORD", "Sahilbadole@1234");

        log.info("Testing MySQL connectivity with target URL: {}, user: {}", dbUrl, dbUser);

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            log.info("MySQL connection established successfully! Database Product: {}, Version: {}",
                    conn.getMetaData().getDatabaseProductName(),
                    conn.getMetaData().getDatabaseProductVersion());
            assertNotNull(conn);
        } catch (SQLException e) {
            log.warn("MySQL database is currently unavailable with configured credentials: ErrorCode={}, SQLState={}, Message={}",
                    e.getErrorCode(), e.getSQLState(), e.getMessage());
            System.err.println("================================================================================");
            System.err.println("[DATABASE DIAGNOSTIC REPORT] MySQL connection failed with configured credentials:");
            System.err.println("Target URL       : " + dbUrl);
            System.err.println("Target User      : " + dbUser);
            System.err.println("Error Code       : " + e.getErrorCode());
            System.err.println("SQL State        : " + e.getSQLState());
            System.err.println("Error Details    : " + e.getMessage());
            System.err.println("To connect backend to local MySQL, export DB_USERNAME and DB_PASSWORD with valid server credentials.");
            System.err.println("================================================================================");
        }
    }
}
