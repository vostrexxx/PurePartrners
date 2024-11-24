package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import partners.agreement_connection_info.config.ConnectionStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgreementInfo {
    private Long initiatorId;
    private Long receiverId;

    private Long initiatorItemId;
    private Long receiverItemId;

    private String comment;

    private int mode;

    private ConnectionStatus status;

    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}