package partners.UserInfo.exception;

import org.springframework.http.HttpStatus;

public class CantSavePersonalDataException extends CustomException{

    public CantSavePersonalDataException(String message, HttpStatus status) {super(message, status);}

}
