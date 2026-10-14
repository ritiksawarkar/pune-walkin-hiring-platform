package com.punewalkin.platform.user;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private String id;
    private String fullName;
    private String email;
    private String role;
    private String accountStatus;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, String id, String fullName, String email, String role, String accountStatus) {
        this(token, id, fullName, email, role, accountStatus, null);
    }

    public AuthResponse(String token, String id, String fullName, String email, String role, String accountStatus, String message) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.accountStatus = accountStatus;
        this.message = message;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
