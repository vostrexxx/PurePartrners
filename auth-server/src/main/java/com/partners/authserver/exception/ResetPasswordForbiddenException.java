package com.partners.authserver.exception;

import org.springframework.http.HttpStatus;

public class ResetPasswordForbiddenException extends CustomException{
    public ResetPasswordForbiddenException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
