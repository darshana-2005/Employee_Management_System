package com.example.ems.dto;

public class LoginResponse {
    private final String token;
    private final String username;
    private final String role;
    private final Long employeeId;

    public LoginResponse(String token, String username, String role, Long employeeId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.employeeId = employeeId;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public Long getEmployeeId() { return employeeId; }
}