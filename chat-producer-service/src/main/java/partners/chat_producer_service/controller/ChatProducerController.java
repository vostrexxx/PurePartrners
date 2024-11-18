package partners.chat_producer_service.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import partners.chat_producer_service.dto.ChatMessage;
import partners.chat_producer_service.dto.NewChat;
import partners.chat_producer_service.dto.OperationStatusResponse;
import partners.chat_producer_service.service.ChatProducerService;

@RestController
@AllArgsConstructor
@RequestMapping("/chat")
public class ChatProducerController {
    private final ChatProducerService service;

    @PostMapping("/message")
    public ResponseEntity<OperationStatusResponse> sendMessage(@RequestBody ChatMessage message) {
        OperationStatusResponse response = service.sendMessage(message);
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> createNewChat(@RequestBody NewChat newChat) {
        OperationStatusResponse response = service.sendNewChat(newChat);
        return ResponseEntity.ok(response);
    }
}
