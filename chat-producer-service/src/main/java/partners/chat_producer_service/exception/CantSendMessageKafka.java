package partners.chat_producer_service.exception;

import org.springframework.http.HttpStatus;

public class CantSendMessageKafka extends CustomException{
    public CantSendMessageKafka(String message, HttpStatus status) {
        super(message, status);
    }
}
