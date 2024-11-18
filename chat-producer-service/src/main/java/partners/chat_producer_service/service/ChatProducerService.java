package partners.chat_producer_service.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import partners.chat_producer_service.dto.ChatMessage;
import partners.chat_producer_service.dto.OperationStatusResponse;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
@Slf4j
public class ChatProducerService {
    private static final String topic = "chats";

    private final KafkaTemplate<String, ChatMessage> kafkaTemplate;

    public OperationStatusResponse sendMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        try {
            kafkaTemplate.send(topic, message);
            log.info("Message sent to" + topic + " {}", message);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            return new OperationStatusResponse(0);
        }
    }
}
