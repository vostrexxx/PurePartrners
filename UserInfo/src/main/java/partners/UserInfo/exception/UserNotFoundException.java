package partners.UserInfo.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends CustomException{

    public UserNotFoundException(String message, HttpStatus status) {super(message, status);}

}
