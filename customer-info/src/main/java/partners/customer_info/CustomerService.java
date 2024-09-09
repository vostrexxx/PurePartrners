package partners.customer_info;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class CustomerService {

    private final CustomerRepository repository;

    public GetCustomerInfoResponse getCustomerInfo(Long userId){
        Optional<CustomerInfo> customerInfo = repository.findById(userId);
        if (customerInfo.isEmpty())
            return new GetCustomerInfoResponse(0, null);
        CustomerInfo actualCustomerInfo = customerInfo.get();
        //map

        return new GetCustomerInfoResponse(1, );
    }

    public StatusResponse saveCustomerInfo(Long userId, CustomerInfo customerInfo){
        //map

        if (savedCustomerInfo.getId() != null)
            return new StatusResponse(1);
        return new StatusResponse(0);
    }

}
