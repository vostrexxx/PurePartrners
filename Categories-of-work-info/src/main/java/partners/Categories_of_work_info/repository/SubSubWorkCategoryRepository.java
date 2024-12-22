package partners.Categories_of_work_info.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import partners.Categories_of_work_info.model.SubSubWorkCategory;

import java.util.Optional;

@Repository
public interface SubSubWorkCategoryRepository extends Neo4jRepository<SubSubWorkCategory, String> {
    Optional<SubSubWorkCategory> findByElementId(String elementId);

    @Query("MATCH (n {elementId: $elementId}) DETACH DELETE n")
    void detachDeleteByElementId(@Param("elementId") String elementId);
}
