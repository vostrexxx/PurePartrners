package partners.customer_info.service;

import partners.customer_info.dto.GetCustomerInfoResponse;
import partners.customer_info.dto.OperationStatusResponse;
import partners.customer_info.repository.CustomerRepository;

import java.util.Optional;

@Service
@AllArgsConstructor
public class CustomerService {
    private CustomerRepository repository;

    public GetCustomerInfoResponse getCustomerInfo(Long userId){
        Optional<Customer> customer = repository.findById(userId);
        if (customer.isEmpty()){
            return new GetCustomerInfoResponse(0, null);
        }
        Customer actualCustomerInfo = customer.get();
        CustomerInfo customerInfo = CustomerInfo.builder();
        //TODO builder

        return new GetCustomerInfoResponse(1, customerInfo);
    }

    public OperationStatusResponse saveCustomerInfo(Long userId, CustomerInfo customerInfo){
        Customer customer = Customer.builder();
        //TODO builder
        Customer savedCustomer = repository.save(customer);
        if (savedCustomer == null){
            return new OperationStatusResponse(0);
        }
        return new OperationStatusResponse(1);
    }
}
