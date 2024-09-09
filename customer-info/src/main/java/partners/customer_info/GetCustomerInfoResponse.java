package partners.customer_info;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetCustomerInfoResponse {
    private int success;
    private CustomerInfo customerInfo;
}
