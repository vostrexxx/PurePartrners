package partners.customer_info.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class CustomerInfo {
    @Nullable
    private String totalCost;
    @Nullable
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
