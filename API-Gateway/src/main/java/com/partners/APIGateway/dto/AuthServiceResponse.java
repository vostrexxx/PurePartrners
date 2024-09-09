package com.partners.APIGateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthServiceResponse {
    private String httpStatus;
    private Long userId;
}
