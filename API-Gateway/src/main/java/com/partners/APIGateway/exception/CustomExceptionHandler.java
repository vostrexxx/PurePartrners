package com.partners.APIGateway.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(TokenValidationException.class)
    public ResponseEntity<String> tokenValidationExceptionHandler(TokenValidationException tokenValidationException){
        return ResponseEntity
                .status(tokenValidationException.getHttpStatus())
                .body(tokenValidationException.getMessage());
    }

}
