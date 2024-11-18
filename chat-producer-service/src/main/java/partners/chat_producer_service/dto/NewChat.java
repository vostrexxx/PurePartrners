package partners.chat_producer_service.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewChat {
    private Long chatId;
    private List<ChatParticipant> participants;
    @Nullable
    private LocalDateTime createdAt;
}
