package com.partners.authserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.math.BigInteger;

@Data
@AllArgsConstructor
public class TokenValidationResponse {
    private HttpStatus httpStatus;
    private Long userId;
}
