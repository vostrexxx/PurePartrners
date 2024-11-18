package partners.chat_consumer_service.dto;

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
    private LocalDateTime timestamp;
}
