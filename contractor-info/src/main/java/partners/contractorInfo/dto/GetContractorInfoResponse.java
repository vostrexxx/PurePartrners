package partners.contractorInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetContractorInfoResponse {
    private int success;
    private ContractorInfo contractor;
}
