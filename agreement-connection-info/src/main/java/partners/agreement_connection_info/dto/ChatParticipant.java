package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import partners.agreement_connection_info.config.ChatParticipantRole;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatParticipant {
    private Long id;
    private ChatParticipantRole role;
}
