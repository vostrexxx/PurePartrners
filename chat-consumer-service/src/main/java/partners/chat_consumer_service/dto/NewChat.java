package partners.chat_consumer_service.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewChat {
    private String chatId;
    private Long chatInitiatorId;
    private Long chatReceiverId;
    private String chatInitiatorName;
    private String chatReceiverName;
    @Nullable
    private LocalDateTime createdAt;
}
