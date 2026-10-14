package com.punewalkin.platform.interview;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host:localhost}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Value("${spring.mail.properties.mail.smtp.auth:false}")
    private boolean smtpAuth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}")
    private boolean starttlsEnable;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        String effectiveHost = host;
        if (("localhost".equalsIgnoreCase(effectiveHost) || effectiveHost == null || effectiveHost.trim().isEmpty())
                && username != null && username.contains("@gmail.com")) {
            effectiveHost = "smtp.gmail.com";
        }
        mailSender.setHost(effectiveHost);
        mailSender.setPort(port);

        if (username != null && !username.trim().isEmpty()) {
            mailSender.setUsername(username.trim());
        }
        if (password != null && !password.trim().isEmpty()) {
            mailSender.setPassword(password.trim().replace(" ", ""));
        }

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");

        // Automatically enable SMTP auth if username is provided or explicitly set to true
        boolean shouldAuth = smtpAuth || (username != null && !username.trim().isEmpty());
        props.put("mail.smtp.auth", String.valueOf(shouldAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(starttlsEnable));
        props.put("mail.smtp.starttls.required", "false");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return mailSender;
    }

    public String getHost() {
        if (("localhost".equalsIgnoreCase(host) || host == null || host.trim().isEmpty())
                && username != null && username.contains("@gmail.com")) {
            return "smtp.gmail.com";
        }
        return host;
    }

    public int getPort() {
        return port;
    }

    public String getUsername() {
        return username;
    }
}
