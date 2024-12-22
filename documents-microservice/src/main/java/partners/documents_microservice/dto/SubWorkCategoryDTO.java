package partners.documents_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubWorkCategoryDTO {
    private String elementId;
    private String nodeId;
    private String subWorkCategoryName;
    private List<SubSubWorkCategoryDTO> subSubWorkCategories;
}
