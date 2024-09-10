package partners.customer_info.dto;

@Data
@AllArgsConstructor
public class GetCustomerInfoResponse {
    private int success;
    private Customer customer;
}
