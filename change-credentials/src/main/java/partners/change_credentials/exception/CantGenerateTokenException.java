package partners.change_credentials.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;


@Data
@AllArgsConstructor
public class CantGenerateTokenException extends CustomException{
    public CantGenerateTokenException(String message, HttpStatus httpStatus) {super(message, httpStatus);}
}
