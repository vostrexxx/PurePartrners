package partners.announcement_info.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "announcement_info")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Announcement {
    @Id
    private Long id;
    private Long userId;
    @Nullable
    private String totalCost;
    private String workCategories;
    @Nullable
    private String metro;
    @Nullable
    private String house;
    private Boolean hasOther;
    @Nullable
    private String other;
    private String objectName;
    @Nullable
    private String startDate;
    @Nullable
    private String finishDate;
    @Nullable
    private String comments;
}
