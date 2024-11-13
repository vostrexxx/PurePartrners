package partners.Categories_of_work_info.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Node("WorkCategory")
@Data
public class Category {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @Relationship(type = "INCLUDES", direction = Relationship.Direction.OUTGOING)
    private List<Category> subCategories;

    public Category(String name, List<Category> subCategories) {
        this.name = name;
        this.subCategories = subCategories;
    }

    public Category(){}
}
