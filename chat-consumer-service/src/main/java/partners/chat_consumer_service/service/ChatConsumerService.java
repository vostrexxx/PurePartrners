package partners.chat_consumer_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import partners.chat_consumer_service.dto.ChatMessage;
import partners.chat_consumer_service.dto.NewChat;

@Service
@Slf4j
public class ChatConsumerService {

    @KafkaListener(topics = "chats", groupId = "chat-consumer", containerFactory = "newChatMessageContainerFactory")
    public void consumeMessage(ChatMessage message) {
        log.info("Received chat message: {}", message);
    }

    @KafkaListener(topics = "newChat", groupId = "new-chat-consumer", containerFactory = "newChatContainerFactory")
    public void consumeNewChatRequest(NewChat newChat) {
        log.info("Received new chat request: {}", newChat);
    }
}
