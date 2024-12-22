package partners.announcement_info.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;

import java.time.LocalDate;

@Entity
@Table(name = "announcements")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Indexed
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Nullable
    @GenericField
    private Double totalCost;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    @Column(nullable = false)
    private String workCategories;

    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String metro;

    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String house;

    @GenericField
    @Column(nullable = false)
    private Boolean hasOther;

    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String other;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    @Column(nullable = false)
    private String objectName;

    @Nullable
    @GenericField
    private LocalDate startDate;

    @Nullable
    @GenericField
    private LocalDate finishDate;

    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    @Column(nullable = false)
    private String comments;
}
