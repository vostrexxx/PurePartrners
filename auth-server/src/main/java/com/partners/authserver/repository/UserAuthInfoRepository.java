package com.partners.authserver.repository;

import com.partners.authserver.model.UserAuthInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.util.Optional;

@Repository
public interface UserAuthInfoRepository extends JpaRepository<UserAuthInfo, Integer> {
    Optional<UserAuthInfo> findByPhoneNumber(String phoneNumber);
    Boolean existsByPhoneNumber(String phoneNumber);

    @Modifying
    @Query("update UserAuthInfo u set u.password = ?1 where u.phoneNumber = ?2")
    int setPasswordByPhoneNumber(String password, String phoneNumber);
}
