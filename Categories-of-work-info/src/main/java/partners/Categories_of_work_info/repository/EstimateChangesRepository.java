package partners.Categories_of_work_info.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.Categories_of_work_info.model.EstimateChanges;

import java.util.List;

@Repository
public interface EstimateChangesRepository extends JpaRepository<EstimateChanges, Long> {
    List<EstimateChanges> findAllByAgreementId(Long agreementId);
}
