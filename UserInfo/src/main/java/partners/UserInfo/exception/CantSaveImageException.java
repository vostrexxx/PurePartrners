package partners.UserInfo.exception;

import org.springframework.http.HttpStatus;

public class CantSaveImageException extends CustomException{
    public CantSaveImageException(String message, HttpStatus status) {
        super(message, status);
    }
}
