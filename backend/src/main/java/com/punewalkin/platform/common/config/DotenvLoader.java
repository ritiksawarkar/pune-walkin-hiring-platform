package com.punewalkin.platform.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class DotenvLoader {

    private static final Logger log = LoggerFactory.getLogger(DotenvLoader.class);
    private static volatile boolean loaded = false;

    private DotenvLoader() {}

    public static synchronized Map<String, Object> load() {
        Map<String, Object> props = new HashMap<>();

        List<File> candidates = new ArrayList<>();
        // Current working directory
        candidates.add(new File(".env"));
        candidates.add(new File("backend/.env"));
        // Relative to user.dir system property
        String userDir = System.getProperty("user.dir", ".");
        candidates.add(new File(userDir, ".env"));
        candidates.add(new File(userDir, "backend/.env"));
        // Parent directory
        candidates.add(new File("../.env"));
        candidates.add(new File("../backend/.env"));

        File target = null;
        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                target = candidate;
                break;
            }
        }

        if (target != null) {
            log.info("Loading environment variables from .env file: {}", target.getAbsolutePath());
            try (BufferedReader reader = new BufferedReader(new FileReader(target, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIndex = line.indexOf('=');
                    if (eqIndex > 0) {
                        String key = line.substring(0, eqIndex).trim();
                        String val = line.substring(eqIndex + 1).trim();

                        // Strip quotes if present
                        if ((val.startsWith("\"") && val.endsWith("\"")) ||
                                (val.startsWith("'") && val.endsWith("'"))) {
                            if (val.length() >= 2) {
                                val = val.substring(1, val.length() - 1);
                            }
                        }

                        props.put(key, val);

                        // If not already set as an environment variable or system property, set system property
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error reading .env file from {}: {}", target.getAbsolutePath(), e.getMessage());
            }
        }

        // Special handling for Gmail and Mail properties
        String mailUsername = (String) props.getOrDefault("MAIL_USERNAME",
                System.getProperty("MAIL_USERNAME", System.getenv("MAIL_USERNAME")));
        if (mailUsername != null && !mailUsername.trim().isEmpty()) {
            if (props.get("MAIL_ENABLED") == null && System.getProperty("MAIL_ENABLED") == null && System.getenv("MAIL_ENABLED") == null) {
                props.put("MAIL_ENABLED", "true");
                System.setProperty("MAIL_ENABLED", "true");
            }
            if (mailUsername.contains("@gmail.com")) {
                if (props.get("MAIL_HOST") == null && System.getProperty("MAIL_HOST") == null && System.getenv("MAIL_HOST") == null) {
                    props.put("MAIL_HOST", "smtp.gmail.com");
                    System.setProperty("MAIL_HOST", "smtp.gmail.com");
                }
            }
        }

        String mailPassword = (String) props.getOrDefault("MAIL_PASSWORD",
                System.getProperty("MAIL_PASSWORD", System.getenv("MAIL_PASSWORD")));
        if (mailPassword != null && mailPassword.contains(" ")) {
            String clean = mailPassword.replace(" ", "");
            props.put("MAIL_PASSWORD", clean);
            System.setProperty("MAIL_PASSWORD", clean);
        }

        String mailFrom = (String) props.getOrDefault("MAIL_FROM",
                System.getProperty("MAIL_FROM", System.getenv("MAIL_FROM")));
        if (mailFrom == null || !mailFrom.contains("@")) {
            if (mailUsername != null && mailUsername.contains("@")) {
                props.put("MAIL_FROM", mailUsername.trim());
                System.setProperty("MAIL_FROM", mailUsername.trim());
            }
        }

        loaded = true;
        return props;
    }
}
