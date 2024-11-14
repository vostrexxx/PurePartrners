package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AgreementsInfo {
    private Long id;
    private Long receiverId;
    private Long initiatorId;

    private Long receiverItemId;
    private Long initiatorItemId;

    private String comment;

    private int mode;
}
