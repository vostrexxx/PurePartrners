package partners.questionnaireInfo.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;

import java.time.LocalDate;

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

    @Column(nullable = false)
    private Long userId;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    @Column(nullable = false)
    private String categoriesOfWork;

    @GenericField
    @Column(nullable = false)
    private Boolean hasTeam;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    @Nullable
    private String team;

    @GenericField
    @Column(nullable = false)
    private Boolean hasEdu;

    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String eduEst;

    @Nullable
    private LocalDate eduDateStart;

    @Nullable
    private LocalDate eduDateEnd;

    @GenericField
    @Column(nullable = false)
    private Integer workExp;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    @Column(nullable = false)
    private String selfInfo;

    @GenericField
    @Column(nullable = false)
    private Double prices;
}
