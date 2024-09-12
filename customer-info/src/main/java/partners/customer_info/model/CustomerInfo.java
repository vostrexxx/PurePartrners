package partners.customer_info.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder
public class CustomerInfo {
    private String totalCost;
    private String workCategories;
    private String metro;
    private String house;
    private String other;
    private String objectName;
    private String startDate;
    private String finishDate;
    private String comments;
}
