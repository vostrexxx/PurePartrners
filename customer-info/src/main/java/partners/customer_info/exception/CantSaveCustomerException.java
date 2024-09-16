package partners.customer_info.exception;

import org.springframework.http.HttpStatusCode;

public class CantSaveCustomerException extends CustomException{
    public CantSaveCustomerException(String message, HttpStatusCode statusCode) {
        super(message, statusCode);
    }
}
