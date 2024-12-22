package partners.Categories_of_work_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class NodeUpdateRequest {
    private Long id;
    private Integer type;
    private String operation;
    private String elementId;
    private String nodeId;
    private String parentId;
    private Long initiatorId;
    private Map<String, Object> updatedFields;
    private List<Map<String, Object>> subSubCategories;
}
