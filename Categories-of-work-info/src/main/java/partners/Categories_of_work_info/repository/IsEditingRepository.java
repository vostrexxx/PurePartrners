package partners.Categories_of_work_info.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.Categories_of_work_info.model.IsEditing;

import java.util.Optional;

@Repository
public interface IsEditingRepository extends JpaRepository<IsEditing, Long> {
    Optional<IsEditing> findByAgreementId(Long agreementId);
}
