package partners.documents_microservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.documents_microservice.model.EstimateInfo;

@Repository
public interface EstimateInfoRepository extends JpaRepository<EstimateInfo, Long> {
}
