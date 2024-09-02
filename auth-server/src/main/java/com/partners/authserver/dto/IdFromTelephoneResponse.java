package com.partners.authserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
public class IdFromTelephoneResponse {
    private HttpStatus httpStatus;
    private Long userId;
}
