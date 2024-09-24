package partners.questionnaireInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetAllPreviews {
    private int success;
    private List<QuestionnairePreview> previews;
}
