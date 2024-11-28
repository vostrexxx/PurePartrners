package partners.chat_producer_service.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private String chatId;
    private String message;
    @Nullable
    private Long initiatorId;
    @Nullable
    private LocalDateTime timestamp;
}
