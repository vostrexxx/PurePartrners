package partners.chat_producer_service.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendChatMessage {
    private String chatId;
    @Nullable
    private String message;
    @Nullable
    private Long initiatorId;
    @Nullable
    private LocalDateTime timestamp;
    @Nullable
    private List<String> imagesUrls;
}
