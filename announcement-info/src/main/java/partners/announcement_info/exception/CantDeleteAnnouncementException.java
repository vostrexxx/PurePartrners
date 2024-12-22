package partners.announcement_info.exception;

import org.springframework.http.HttpStatusCode;

public class CantDeleteAnnouncementException extends CustomException{
    public CantDeleteAnnouncementException(String message, HttpStatusCode statusCode) {
        super(message, statusCode);
    }
}
