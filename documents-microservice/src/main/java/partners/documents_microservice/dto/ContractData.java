package partners.documents_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractData {
    private Contractor contractor;
    private Customer customer;
    private Project project;
}
