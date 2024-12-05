package partners.chat_consumer_service.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat")
public class Chat {
    @Id
    private String id;

    private String chatReceiverName;
    private String chatInitiatorName;

    private Long chatReceiverId;
    private Long chatInitiatorId;
    private Boolean isSpecialist;
    private Long agreementId;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
