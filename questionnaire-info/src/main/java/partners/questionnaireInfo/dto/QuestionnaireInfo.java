package partners.questionnaireInfo.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionnaireInfo {
    private String categoriesOfWork;

    @Nullable
    private String eduDateEnd;

    private Boolean hasTeam;

    @Nullable
    private String team;

    @Nullable
    private Boolean hasEdu;

    @Nullable
    private String eduEst;

    @Nullable
    private String eduDateStart;

    private String workExp;

    private String selfInfo;

    private String prices;
    private List<String> questionnaireImages;
}
