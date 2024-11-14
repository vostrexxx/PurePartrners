package partners.Categories_of_work_info.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;
import partners.Categories_of_work_info.model.Category;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriesRepository extends Neo4jRepository<Category, Long> {
    @Query("MATCH (c:WorkCategory {name: $name})-[:INCLUDES]->(subcategory) RETURN subcategory.name")
    List<String> findByNameWithSubCategories(String name);
}
