package partners.customer_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import partners.customer_info.model.CustomerInfo;

@Data
@AllArgsConstructor
public class GetCustomerInfoResponse {
    private int success;
    private CustomerInfo customer;
}
