package com.partners.APIGateway;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigInteger;

@Data
@AllArgsConstructor
public class AuthServiceResponse {
    private String httpStatus;
    private Long userId;
}
