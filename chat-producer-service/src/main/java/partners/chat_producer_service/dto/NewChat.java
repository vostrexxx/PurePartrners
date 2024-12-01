package partners.chat_producer_service.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewChat {
    private String chatId;
    private Long chatReceiverId;
    private Long chatInitiatorId;
    private String chatInitiatorName;
    private String chatReceiverName;
    private Boolean isSpecialist;
}
