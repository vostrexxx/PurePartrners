package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class NewChat {
    private Long chatId;
    private List<ChatParticipant> participants;
}
