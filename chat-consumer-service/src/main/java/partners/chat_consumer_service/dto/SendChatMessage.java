package partners.chat_consumer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendChatMessage {
    private String chatId;
    private String message;
    private String initiatorId;
    private LocalDateTime timestamp;
}
