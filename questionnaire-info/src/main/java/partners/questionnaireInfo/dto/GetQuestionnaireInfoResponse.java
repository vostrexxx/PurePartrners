package partners.questionnaireInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetQuestionnaireInfoResponse {
    private int success;
    private QuestionnaireInfo questionnaireInfo;
}
