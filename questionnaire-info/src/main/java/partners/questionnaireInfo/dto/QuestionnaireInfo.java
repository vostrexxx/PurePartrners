package partners.questionnaireInfo.dto;

import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionnaireInfo {
    private Long id;

    private String workCategories;

    private Long userId;

    @Nullable
    private LocalDate eduDateEnd;

    private Boolean hasTeam;

    @Nullable
    private String team;

    @Nullable
    private Boolean hasEdu;

    @Nullable
    private String eduEst;

    @Nullable
    private LocalDate eduDateStart;

    private Integer workExp;

    private String selfInfo;

    private Double prices;

    @Nullable
    private List<String> questionnaireImages;
}
