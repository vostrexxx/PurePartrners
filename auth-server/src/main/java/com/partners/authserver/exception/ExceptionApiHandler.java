package com.partners.authserver.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionApiHandler {

    @ExceptionHandler(PhoneNumberTakenException.class)
    public ResponseEntity<String> handleEmailTakenException(PhoneNumberTakenException telephoneTakenException){
        return ResponseEntity
                .status(telephoneTakenException.getHttpStatus())
                .body(telephoneTakenException.getMessage());
    }

    @ExceptionHandler(CantSaveUserException.class)
    public ResponseEntity<String> handleCantSaveUserException(CantSaveUserException cantSaveUserException){
        return ResponseEntity
                .status(cantSaveUserException.getHttpStatus())
                .body(cantSaveUserException.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentialsException(BadCredentialsException badCredentialsException){
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(badCredentialsException.getMessage());
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<String> handleInvalidTokenException(InvalidTokenException invalidTokenException){
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(invalidTokenException.getMessage());
    }
}
