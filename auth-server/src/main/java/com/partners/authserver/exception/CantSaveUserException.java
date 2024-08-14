package com.partners.authserver.exception;

import org.springframework.http.HttpStatus;

public class CantSaveUserException extends CustomException{
    public CantSaveUserException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
