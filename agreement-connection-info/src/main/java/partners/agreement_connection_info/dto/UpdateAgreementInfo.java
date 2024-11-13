package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import partners.agreement_connection_info.config.ConnectionStatus;

@Data
@AllArgsConstructor
public class UpdateAgreementInfo {
    private ConnectionStatus newStatus;
    private Long agreementId;
}
