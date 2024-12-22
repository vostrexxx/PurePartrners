package partners.announcement_info.exception;

import org.springframework.http.HttpStatusCode;

public class CantUpdateAnnouncementException extends CustomException{
    public CantUpdateAnnouncementException(String message, HttpStatusCode statusCode) {
        super(message, statusCode);
    }
}
