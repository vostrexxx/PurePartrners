package partners.questionnaireInfo.exception;

import org.springframework.http.HttpStatus;

public class CantDeleteQuestionnaireException extends CustomException{
    public CantDeleteQuestionnaireException(String message, HttpStatus status) {
        super(message, status);
    }
}
