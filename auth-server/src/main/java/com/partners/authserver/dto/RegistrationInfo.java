package com.partners.authserver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RegistrationInfo {
    private String phoneNumber;
    private String password;
}
