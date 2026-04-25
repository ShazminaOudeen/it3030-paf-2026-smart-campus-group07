package com.assetra.notification.dto;

import lombok.Data;

@Data
public class CreateStaffRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private String role;
}