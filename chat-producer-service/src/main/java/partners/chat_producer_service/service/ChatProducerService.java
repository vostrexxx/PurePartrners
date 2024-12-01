package partners.chat_producer_service.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.chat_producer_service.dto.ChatMessage;
import partners.chat_producer_service.dto.NewChat;
import partners.chat_producer_service.dto.OperationStatusResponse;
import partners.chat_producer_service.dto.SendChatMessage;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@Slf4j
public class ChatProducerService {
    private static final String chatsTopic = "messages";
    private static final String newChatTopic = "newChat";

    private final KafkaTemplate<String, SendChatMessage> newMessageKafkaTemplate;
    private final KafkaTemplate<String, NewChat> newChatKafkaTemplate;
    private final ModelMapper modelMapper;

    public OperationStatusResponse sendMessage(ChatMessage message, Long userId) {
        message.setInitiatorId(userId);
        List<String> images = new ArrayList<>();
        try {
            if (message.getFiles() != null) {
                for (MultipartFile image : message.getFiles()) {
                    String fileName = UUID.randomUUID().toString();
                    Files.createDirectories(Path.of("src/main/resources/images/attachments/" + userId));
                    String imagePath = "src/main/resources/images/attachments/" + userId + "/" + fileName + image.getOriginalFilename();
                    image.transferTo(Path.of(imagePath));
                    String imagePathForSearch = userId + "/" + fileName + image.getOriginalFilename();
                    images.add(imagePathForSearch);
                }
            }
            SendChatMessage sendChatMessage = modelMapper.map(message, SendChatMessage.class);
            sendChatMessage.setImagesUrls(images);
            newMessageKafkaTemplate.send(chatsTopic, sendChatMessage);
            log.info("Message sent to" + chatsTopic + " {}", sendChatMessage);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            log.error(e.getMessage());
            return new OperationStatusResponse(0);
        }
    }

    public OperationStatusResponse sendNewChat(NewChat newChat) {
        try {
            newChatKafkaTemplate.send(newChatTopic, newChat);
            log.info("Message sent to" + newChatTopic + " {}", newChat);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            return new OperationStatusResponse(0);
        }
    }

    public Resource getImageByPath(String imagePath){
        String fullImagePath = "src/main/resources/images/attachments/" + imagePath;
        File file = new File(fullImagePath);
        if (file.exists()){
            return new FileSystemResource(file);
        } else
            return null;
    }
}
