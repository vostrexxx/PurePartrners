package partners.documents_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class EstimateDTO {
    private Long agreementId;
    private List<SubWorkCategoryDTO> estimate;
}
