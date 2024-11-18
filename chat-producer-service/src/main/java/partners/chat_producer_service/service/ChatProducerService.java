package partners.chat_producer_service.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import partners.chat_producer_service.dto.ChatMessage;
import partners.chat_producer_service.dto.NewChat;
import partners.chat_producer_service.dto.OperationStatusResponse;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
@Slf4j
public class ChatProducerService {
    private static final String chatsTopic = "chats";
    private static final String newChatTopic = "newChat";

    private final KafkaTemplate<String, ChatMessage> newMessageKafkaTemplate;
    private final KafkaTemplate<String, NewChat> newChatKafkaTemplate;


    public OperationStatusResponse sendMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        try {
            newMessageKafkaTemplate.send(chatsTopic, message);
            log.info("Message sent to" + chatsTopic + " {}", message);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            return new OperationStatusResponse(0);
        }
    }

    public OperationStatusResponse sendNewChat(NewChat newChat) {
        newChat.setCreatedAt(LocalDateTime.now());
        try {
            newChatKafkaTemplate.send(newChatTopic, newChat);
            log.info("Message sent to" + newChatTopic + " {}", newChat);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            return new OperationStatusResponse(0);
        }
    }
}
