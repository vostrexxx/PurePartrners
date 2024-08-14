package com.partners.APIGateway;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
public class TokenValidationException extends RuntimeException{
    private HttpStatus httpStatus;
    private String message;
}
