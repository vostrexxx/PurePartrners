package com.partners.authserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginInfo {
    private String phoneNumber;
    private String password;
}
