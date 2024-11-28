package partners.chat_consumer_service.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.chat_consumer_service.dto.ChatHistory;
import partners.chat_consumer_service.dto.IsChatExists;
import partners.chat_consumer_service.service.ChatConsumerService;

@RestController
@CrossOrigin
@AllArgsConstructor
@RequestMapping("/chat")
public class ChatConsumerController {
    private final ChatConsumerService service;

    @GetMapping("/exists")
    public ResponseEntity<IsChatExists> isChatCreated(@RequestParam String chatId){
        IsChatExists response = service.ifChatExists(chatId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<ChatHistory> getAllPreviousMessages(@RequestHeader Long userId, @RequestParam String chatId){
        ChatHistory response = service.getChatHistory(userId, chatId);
        return ResponseEntity.ok(response);
    }
}
