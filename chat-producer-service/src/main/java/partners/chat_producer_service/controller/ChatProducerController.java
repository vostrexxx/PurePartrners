package partners.chat_producer_service.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.chat_producer_service.dto.ChatMessage;
import partners.chat_producer_service.dto.NewChat;
import partners.chat_producer_service.dto.OperationStatusResponse;
import partners.chat_producer_service.service.ChatProducerService;

@RestController
@AllArgsConstructor
@RequestMapping("/event")
public class ChatProducerController {
    private final ChatProducerService service;

    @PostMapping("/new-message")
    public ResponseEntity<OperationStatusResponse> sendMessage(@RequestBody ChatMessage message,
                                                               @RequestHeader Long userId) {
        OperationStatusResponse response = service.sendMessage(message, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/new-chat")
    public ResponseEntity<OperationStatusResponse> createNewChat(@RequestBody NewChat newChat) {
        OperationStatusResponse response = service.sendNewChat(newChat);
        return ResponseEntity.ok(response);
    }
}
