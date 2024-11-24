package partners.announcement_info.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class AnnouncementInfo {
    private Long id;
    private Long userId;
    @Nullable
    private Double totalCost;
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
    private LocalDate startDate;
    @Nullable
    private LocalDate finishDate;
    private String comments;
    @Nullable
    private List<String> announcementImages;
}
