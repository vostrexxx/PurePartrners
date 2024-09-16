package partners.change_credentials.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionApiHandler {

    @ExceptionHandler(CantGenerateTokenException.class)
    public ResponseEntity<String> handeCantGenerateTokenException(CantGenerateTokenException e) {
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(e.getMessage());
    }

    @ExceptionHandler(NoResetCodeException.class)
    public ResponseEntity<String> handeNoResetCodeException(NoResetCodeException e) {
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(e.getMessage());
    }


}
