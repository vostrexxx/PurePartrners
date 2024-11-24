package partners.Customer_info.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.Customer_info.model.CustomerInfo;

import java.util.Optional;

@Repository
public interface CustomerInfoRepository extends JpaRepository<CustomerInfo, Long> {
    Optional<CustomerInfo> findByUserId(Long userId);
}
