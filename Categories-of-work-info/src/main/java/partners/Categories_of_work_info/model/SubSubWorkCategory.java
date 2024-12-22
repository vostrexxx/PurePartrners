package partners.Categories_of_work_info.model;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Data
@Node("SubSubWorkCategory")
public class SubSubWorkCategory {
    @Id
    private String elementId;
    private String nodeId;
    private String subSubWorkCategoryName;
    private String workAmount;
    private String measureUnit;
    private Double price;

    public SubSubWorkCategory() {
    }

    public SubSubWorkCategory(String subSubWorkCategoryName, String workAmount, String measureUnit, Double price) {
        this.subSubWorkCategoryName = subSubWorkCategoryName;
        this.workAmount = workAmount;
        this.measureUnit = measureUnit;
        this.price = price;
    }
}
