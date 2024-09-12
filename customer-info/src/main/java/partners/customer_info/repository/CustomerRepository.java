package partners.customer_info.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.customer_info.model.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
