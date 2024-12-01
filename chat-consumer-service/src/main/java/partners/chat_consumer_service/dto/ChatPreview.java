package partners.chat_consumer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatPreview {
    private String chatId;
    private String lastMessage;
    private String title;
    private LocalDateTime lastMessageTime;
}
