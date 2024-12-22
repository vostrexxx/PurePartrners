package partners.questionnaireInfo.exception;

import org.springframework.http.HttpStatus;

public class CantDeleteImageException extends CustomException{
    public CantDeleteImageException(String message, HttpStatus status) {
        super(message, status);
    }
}
