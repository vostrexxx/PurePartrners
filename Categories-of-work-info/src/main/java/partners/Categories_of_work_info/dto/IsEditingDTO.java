package partners.Categories_of_work_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IsEditingDTO {
    private Boolean isEditing;
    private Long agreementId;
    private Long initiatorId;
}
