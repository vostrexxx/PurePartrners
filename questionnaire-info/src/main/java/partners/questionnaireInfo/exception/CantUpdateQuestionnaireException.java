package partners.questionnaireInfo.exception;

import org.springframework.http.HttpStatus;

public class CantUpdateQuestionnaireException extends CustomException{
    public CantUpdateQuestionnaireException(String message, HttpStatus status) {
        super(message, status);
    }
}
