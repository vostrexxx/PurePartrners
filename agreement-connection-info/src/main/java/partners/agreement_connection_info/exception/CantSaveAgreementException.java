package partners.agreement_connection_info.exception;

import org.springframework.http.HttpStatus;

public class CantSaveAgreementException extends CustomException{
    public CantSaveAgreementException(String message, HttpStatus status) {
        super(message, status);
    }
}
