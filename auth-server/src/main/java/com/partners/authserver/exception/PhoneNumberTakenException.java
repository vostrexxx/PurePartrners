package com.partners.authserver.exception;

import org.springframework.http.HttpStatus;
public class PhoneNumberTakenException extends CustomException{
    public PhoneNumberTakenException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
