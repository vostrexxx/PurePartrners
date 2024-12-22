package partners.Categories_of_work_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProcessEstimateChangeCardRequest {
    private NodeUpdateRequest changes;
    private Long agreementId;
}
