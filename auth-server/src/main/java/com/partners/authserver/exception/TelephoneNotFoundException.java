package com.partners.authserver.exception;

import org.springframework.http.HttpStatus;

public class TelephoneNotFoundException extends CustomException{

    public TelephoneNotFoundException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
