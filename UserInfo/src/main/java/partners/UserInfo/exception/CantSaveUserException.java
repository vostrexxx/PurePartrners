package partners.UserInfo.exception;


import org.springframework.http.HttpStatus;

public class CantSaveUserException extends CustomException{
    public CantSaveUserException(String message, HttpStatus status) {
        super(message, status);
    }
}
