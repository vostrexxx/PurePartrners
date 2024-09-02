package partners.change_credentials;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChangeCredentialsRepository extends JpaRepository<ChangeCredentials, Long> {
}
