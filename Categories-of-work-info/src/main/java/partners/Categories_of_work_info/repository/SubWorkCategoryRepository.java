package partners.Categories_of_work_info.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import partners.Categories_of_work_info.model.SubWorkCategory;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubWorkCategoryRepository extends Neo4jRepository<SubWorkCategory, String> {
    List<SubWorkCategory> findAllByAgreementId(Long agreementId);
    Optional<SubWorkCategory> findByElementId(String elementId);
    @Query("MATCH (n {elementId: $elementId}) OPTIONAL MATCH (n)-[:HAS_SUBWORK_CATEGORY]->(m) DETACH DELETE n, m")
    void detachDeleteByElementId(@Param("elementId") String elementId);

}