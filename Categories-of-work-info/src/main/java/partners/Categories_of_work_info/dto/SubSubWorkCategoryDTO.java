package partners.Categories_of_work_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubSubWorkCategoryDTO {
    private String elementId;
    private String nodeId;
    private String subSubWorkCategoryName;
    private String workAmount;
    private String measureUnit;
    private Double price;
}
