package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AgreementInfo {
    private Long receiverId;

    private Long initiatorItemId;
    private Long receiverItemId;

    private String comment;

    private int mode;

    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}