package partners.contractorInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.contractorInfo.model.Contractor;

@Repository
public interface ContractorRepository extends JpaRepository<Contractor, Long> {
}
