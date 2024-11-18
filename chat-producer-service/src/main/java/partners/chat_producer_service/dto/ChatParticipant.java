package partners.chat_producer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import partners.chat_producer_service.config.ChatParticipantType;

@Data
@AllArgsConstructor
public class ChatParticipant {
    private Long id;
    private ChatParticipantType type;
}
