package partners.chat_consumer_service.service;

import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import partners.chat_consumer_service.dto.ChatMessage;

@Service
@AllArgsConstructor
public class NotifyMessageWebSockerService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendMessage(ChatMessage message, String chatId) {
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
    }
}
