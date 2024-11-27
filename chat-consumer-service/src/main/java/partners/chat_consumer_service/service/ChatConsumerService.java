package partners.chat_consumer_service.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import partners.chat_consumer_service.dto.ChatMessage;
import partners.chat_consumer_service.dto.IsChatExists;
import partners.chat_consumer_service.dto.NewChat;
import partners.chat_consumer_service.dto.OperationStatusResponse;
import partners.chat_consumer_service.model.Chat;
import partners.chat_consumer_service.repository.ChatConsumerRepository;
import partners.chat_consumer_service.repository.MessageRepository;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
@Slf4j
public class ChatConsumerService {

    private final ChatConsumerRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ModelMapper modelMapper = new ModelMapper();

    @KafkaListener(topics = "chats", groupId = "chat-consumer", containerFactory = "newChatMessageContainerFactory")
    public void consumeMessage(ChatMessage message) {
        log.info("Received chat message: {}", message);
    }

    @KafkaListener(topics = "newChat", groupId = "new-chat-consumer", containerFactory = "newChatContainerFactory")
    public void consumeNewChatRequest(NewChat newChat) {
        log.info("Received new chat request: {}", newChat);
        newChat.setCreatedAt(LocalDateTime.now());
        try {
            Chat chat = modelMapper.map(newChat, Chat.class);
            chatRepository.save(chat);
            log.info("Saved new chat: {}", newChat);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    public IsChatExists ifChatExists(String chatId){
        Boolean isChatExists = chatRepository.existsById(chatId);
        return new IsChatExists(isChatExists);
    }
}
