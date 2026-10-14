package com.punewalkin.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
public class PlatformApplication {

    public static void main(String[] args) {
        // Load .env configuration before Spring Boot boots
        com.punewalkin.platform.common.config.DotenvLoader.load();
        // Set standard platform timezone to Asia/Kolkata
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(PlatformApplication.class, args);
    }
}
