package partners.agreement_connection_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AllUserAgreements {
    private Long userId;
    private List<AgreementResponse> agreements;
}
