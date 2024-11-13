package partners.agreement_connection_info.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.agreement_connection_info.model.Agreement;

import java.util.List;

@Repository
public interface AgreementRepository extends JpaRepository<Agreement, Long> {
    List<Agreement> findAllByReceiverId(Long receiverId);
}
