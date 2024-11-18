package com.partners.authserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyResetPasswordCode {
    private String phoneNumber;
    private String code;
}
