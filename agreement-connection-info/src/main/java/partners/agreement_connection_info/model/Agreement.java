package partners.agreement_connection_info.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import partners.agreement_connection_info.config.ConnectionStatus;

import java.time.LocalDateTime;

@Entity
@Table
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Agreement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false)
    private Long initiatorId;

    @Column(nullable = false)
    private Long initiatorItemId;

    @Column(nullable = false)
    private Long receiverItemId;

    @Column(nullable = false)
    private String comment;

    @Column(nullable = false)
    private int mode;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ConnectionStatus status;

    @Column(nullable = false)
    private LocalDateTime createDate;

    @Column(nullable = false)
    private LocalDateTime updateDate;

    @PrePersist
    protected void onCreate() {
        this.createDate = LocalDateTime.now();
        this.updateDate = LocalDateTime.now();
        this.status = ConnectionStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updateDate = LocalDateTime.now();
    }
}
