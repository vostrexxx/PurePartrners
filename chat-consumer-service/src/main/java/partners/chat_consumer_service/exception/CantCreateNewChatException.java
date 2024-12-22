package partners.chat_consumer_service.exception;

import org.springframework.http.HttpStatus;

public class CantCreateNewChatException extends CustomException{
    public CantCreateNewChatException(String message, HttpStatus status) {
        super(message, status);
    }
}
