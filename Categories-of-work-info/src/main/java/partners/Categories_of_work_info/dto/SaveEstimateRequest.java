package partners.Categories_of_work_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SaveEstimateRequest {
    private Long agreementId;
    private List<SubWorkCategoryDTO> estimate;
}
