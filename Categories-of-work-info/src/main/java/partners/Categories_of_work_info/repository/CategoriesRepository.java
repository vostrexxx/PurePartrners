package partners.Categories_of_work_info.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import partners.Categories_of_work_info.dto.CategoryWithSubCategories;
import partners.Categories_of_work_info.model.Category;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface CategoriesRepository extends Neo4jRepository<Category, Long> {
    @Query("""
    MATCH (c:Category {name: $name})-[:HAS_CHILD]->(subcategory)
    RETURN subcategory.name
""")
    List<String> findByNameWithSubCategories(@Param("name") String name);

    @Query("""
        CALL db.index.fulltext.queryNodes("workCategoriesWithNames", $searchText)
        YIELD node
        OPTIONAL MATCH (node)-[:HAS_CHILD]->(child)
        RETURN node, collect(child) AS children
    """)
    List<CategoryWithSubCategories> findNodeWithRelated(@Param("searchText") String searchText);
}
