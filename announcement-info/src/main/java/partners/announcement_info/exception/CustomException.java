package partners.announcement_info.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatusCode;

@Data
@AllArgsConstructor
public class CustomException extends Exception {
    private String message;
    private HttpStatusCode statusCode;
}
