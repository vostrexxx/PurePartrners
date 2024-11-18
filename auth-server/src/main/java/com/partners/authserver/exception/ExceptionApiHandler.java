package com.partners.authserver.exception;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.InternalServerErrorException;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionApiHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentialsException(BadCredentialsException badCredentialsException){
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(badCredentialsException.getMessage());
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<String> handleInvalidTokenException(InvalidTokenException invalidTokenException){
        return ResponseEntity
                .status(invalidTokenException.getHttpStatus())
                .body(invalidTokenException.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<String> handleBadRequestException(BadRequestException badRequestException){
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(badRequestException.getMessage());
    }

    @ExceptionHandler(InternalServerErrorException.class)
    public ResponseEntity<String> handleInternalServerErrorException(InternalServerErrorException internalServerErrorException){
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(internalServerErrorException.getMessage());
    }

    @ExceptionHandler(ResetPasswordForbiddenException.class)
    public ResponseEntity<String> handleResetPasswordForbiddenException(ResetPasswordForbiddenException resetPasswordForbiddenException){
        return ResponseEntity
                .status(resetPasswordForbiddenException.getHttpStatus())
                .body(resetPasswordForbiddenException.getMessage());
    }
}
