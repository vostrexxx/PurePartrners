package com.partners.authserver.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reset-code")
public class PasswordResetCode {
    @Id
    private Long id;
    private String code;
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserAuthInfo user;

    private LocalDateTime expiresAt;
}
