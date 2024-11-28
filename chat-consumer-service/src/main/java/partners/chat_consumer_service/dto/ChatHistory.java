package partners.chat_consumer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatHistory {
    private String chatId;
    private Long userId;
    private List<ChatMessage> allMessages;
}
