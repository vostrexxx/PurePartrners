package partners.UserInfo.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionAPIHandler {
    @ExceptionHandler
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException userNotFoundException){
        return ResponseEntity
                .status(userNotFoundException.getStatus())
                .body(userNotFoundException.getMessage());
    }
}
