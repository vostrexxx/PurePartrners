package partners.UserInfo.exception;

import org.springframework.http.HttpStatus;

public class NoImageException extends CustomException{
    public NoImageException(String message, HttpStatus status) {
        super(message, status);
    }
}
