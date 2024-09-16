package partners.customer_info.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionApiHandler {

    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<String> handlerImageNotFoundException(ImageNotFoundException e) {
        return ResponseEntity
                .status(e.getStatusCode())
                .body(e.getMessage());
    }

    @ExceptionHandler(CantSaveCustomerException.class)
    public ResponseEntity<String> handlerCantSaveCustomerException(CantSaveCustomerException e) {
        return ResponseEntity
                .status(e.getStatusCode())
                .body(e.getMessage());
    }
}
