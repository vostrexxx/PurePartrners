package partners.questionnaireInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
public class SaveQuestionnaireImages {
    private Long questionnaireId;
    private MultipartFile[] questionnaireImages;
}
