package partners.documents_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Customer {
    private Boolean isLegalEntity;

    private String fullName;

    private String firm;

    private String position;

    private String address;

    private String INN;

    private String KPP;

    private String bank;

    private String currAcc;

    private String corrAcc;

    private String BIK;
}
