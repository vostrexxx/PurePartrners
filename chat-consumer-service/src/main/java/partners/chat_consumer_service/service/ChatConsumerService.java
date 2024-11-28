package partners.chat_consumer_service.service;

import jakarta.ws.rs.NotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import partners.chat_consumer_service.dto.*;
import partners.chat_consumer_service.model.Chat;
import partners.chat_consumer_service.model.Message;
import partners.chat_consumer_service.repository.ChatRepository;
import partners.chat_consumer_service.repository.MessageRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class ChatConsumerService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ModelMapper modelMapper;

    @KafkaListener(topics = "messages", groupId = "chat-consumer", containerFactory = "newChatMessageContainerFactory")
    public void consumeMessage(SendChatMessage message) {
        log.info("Received chat message: {}", message);
        Chat chat = chatRepository.findById(message.getChatId())
                .orElseThrow(NotFoundException::new);
        message.setTimestamp(LocalDateTime.now());
        try {
            Message newMessage = modelMapper.map(message, Message.class);
            newMessage.setChat(chat);
            messageRepository.save(newMessage);
            log.info("Saved new message: {}", newMessage);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
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

    public ChatHistory getChatHistory(Long userId, String chatId){
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(NotFoundException::new);
        List<Message> allMessages = messageRepository.findAllByChat(chat);
        ChatHistory chatHistory = new ChatHistory();
        chatHistory.setChatId(chatId);
        chatHistory.setUserId(userId);
        List<ChatMessage> messages = new ArrayList<>();
        if (!allMessages.isEmpty()){
            for (Message message : allMessages) {
                messages.add(modelMapper.map(message, ChatMessage.class));
            }
        }
        chatHistory.setAllMessages(messages);
        return chatHistory;
    }
}
