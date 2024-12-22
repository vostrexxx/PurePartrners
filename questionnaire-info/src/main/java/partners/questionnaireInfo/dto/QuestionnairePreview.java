package partners.questionnaireInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionnairePreview {
    private Long id;
    private String workCategories;
    private Long userId;
}
