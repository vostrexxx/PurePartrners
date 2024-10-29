package partners.questionnaireInfo.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;

@Entity
@Table(name = "questionnaires")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Indexed
public class Questionnaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String categoriesOfWork;

    private Boolean hasTeam;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String team;

    private Boolean hasEdu;

    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String eduEst;

    @Nullable
    private String eduDateStart;

    @Nullable
    private String eduDateEnd;

    private String workExp;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String selfInfo;

    private String prices;
}
