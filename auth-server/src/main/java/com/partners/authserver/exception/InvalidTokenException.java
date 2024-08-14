package com.partners.authserver.exception;

import org.springframework.http.HttpStatus;

public class InvalidTokenException extends CustomException{

    public InvalidTokenException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
