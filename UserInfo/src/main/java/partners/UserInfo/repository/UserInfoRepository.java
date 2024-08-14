package partners.UserInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import partners.UserInfo.model.UserInfo;

import java.util.Optional;

public interface UserInfoRepository extends JpaRepository<UserInfo, Integer> {
    Optional<UserInfo> findById(Long id);
}
