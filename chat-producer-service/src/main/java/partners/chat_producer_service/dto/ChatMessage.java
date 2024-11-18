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
    private Long chatId;
    private String message;
    private Long senderId;
    private Long receiverId;
    @Nullable
    private LocalDateTime timestamp;
}
