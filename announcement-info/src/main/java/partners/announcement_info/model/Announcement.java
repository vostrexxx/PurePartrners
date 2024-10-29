package partners.announcement_info.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;

@Entity
@Table(name = "announcement_info")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Indexed
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    @Nullable
    private String totalCost;
    @Column(nullable = false)
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String workCategories;
    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String metro;
    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String house;
    private Boolean hasOther;
    @Nullable
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String other;
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String objectName;
    @Nullable
    private String startDate;
    @Nullable
    private String finishDate;
    @FullTextField(analyzer = "autocomplete_indexing", searchAnalyzer = "autocomplete_search")
    private String comments;
}
