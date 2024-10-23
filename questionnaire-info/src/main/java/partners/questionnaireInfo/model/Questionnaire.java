package partners.questionnaireInfo.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questionnaires")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Questionnaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String categoriesOfWork;

    private Boolean hasTeam;

    private String team;

    private Boolean hasEdu;

    @Nullable
    private String eduEst;

    @Nullable
    private String eduDateStart;

    @Nullable
    private String eduDateEnd;

    private String workExp;

    private String selfInfo;

    private String prices;
}
