package partners.Categories_of_work_info.dto;

import lombok.Data;
import partners.Categories_of_work_info.model.Category;

import java.util.List;

@Data
public class CategoryWithSubCategories {
    private Category node;
    private List<Category> children;

    public CategoryWithSubCategories(Category node, List<Category> children) {
        this.node = node;
        this.children = children;
    }
}
