package partners.change_credentials.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
public class NoResetCodeException extends CustomException{

    public NoResetCodeException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
