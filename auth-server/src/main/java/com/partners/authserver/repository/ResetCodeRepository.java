package com.partners.authserver.repository;

import com.partners.authserver.model.PasswordResetCode;
import com.partners.authserver.model.UserAuthInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findByUserAuthInfo(UserAuthInfo userAuthInfo);
    Optional<PasswordResetCode> findByUserAuthInfoAndIsVerified(UserAuthInfo userAuthInfo, boolean isVerified);
}
