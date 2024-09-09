package partners.change_credentials.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.change_credentials.model.ChangeCredentials;

@Repository
public interface ChangeCredentialsRepository extends JpaRepository<ChangeCredentials, Long> {
}
