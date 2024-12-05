package partners.Categories_of_work_info.model;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import java.util.List;

@Node
@Data
public class Category {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @Relationship(type = "HAS_CHILD", direction = Relationship.Direction.OUTGOING)
    private List<Category> subCategories;

    public Category(String name, List<Category> subCategories) {
        this.name = name;
        this.subCategories = subCategories;
    }

    public Category(){}
}
