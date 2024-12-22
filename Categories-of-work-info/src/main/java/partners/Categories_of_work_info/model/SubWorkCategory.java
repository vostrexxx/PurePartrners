package partners.Categories_of_work_info.model;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("SubWorkCategory")
@Data
public class SubWorkCategory {
    @Id
    private String elementId;

    private Long agreementId;
    private String nodeId;

    private String subWorkCategoryName;
    @Relationship(type = "HAS_SUBWORK_CATEGORY", direction = Relationship.Direction.OUTGOING)
    private List<SubSubWorkCategory> subSubWorkCategories;

    public SubWorkCategory() {
    }

    public SubWorkCategory(Long agreementId, String subWorkCategoryName, List<SubSubWorkCategory> subSubWorkCategories) {
        this.agreementId = agreementId;
        this.subWorkCategoryName = subWorkCategoryName;
        this.subSubWorkCategories = subSubWorkCategories;
    }
}
