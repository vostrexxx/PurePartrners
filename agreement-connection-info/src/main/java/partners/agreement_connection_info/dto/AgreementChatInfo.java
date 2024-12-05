package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AgreementChatInfo {
    private AgreementInfo agreementInfo;
    private Long userId;
}
