package partners.customer_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetCustomerInfoResponse {
    private int success;
    private CustomerInfo customer;
}