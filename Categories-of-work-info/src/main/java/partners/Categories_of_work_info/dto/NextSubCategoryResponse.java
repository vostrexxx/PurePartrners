package partners.Categories_of_work_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
public class NextSubCategoryResponse {
    private int success;
    private List<String> nextSubCategories;
}
