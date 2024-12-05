package partners.chat_producer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewChat {
    private String chatId;
    private Long chatReceiverId;
    private Long chatInitiatorId;
    private String chatInitiatorName;
    private String chatReceiverName;
    private Boolean isSpecialist;
    private Long agreementId;
}
