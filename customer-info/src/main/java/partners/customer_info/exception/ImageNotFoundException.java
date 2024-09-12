package partners.customer_info.exception;


import org.springframework.http.HttpStatusCode;

public class ImageNotFoundException extends CustomException{

    public ImageNotFoundException(String message, HttpStatusCode statusCode) {
        super(message, statusCode);
    }
}
