package partners.customer_info.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.customer_info.dto.GetCustomerInfoResponse;
import partners.customer_info.dto.OperationStatusResponse;
import partners.customer_info.model.Customer;
import partners.customer_info.model.CustomerInfo;
import partners.customer_info.service.CustomerService;

@RestController
@AllArgsConstructor
@CrossOrigin
@RequestMapping("/customer")
public class CustomerController {
    private CustomerService service;

    @GetMapping("")
    public ResponseEntity<GetCustomerInfoResponse> getCustomerInfo(@RequestHeader Long userId){
        GetCustomerInfoResponse response = service.getCustomerInfo(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> saveCustomerInfo(@RequestHeader Long userId, @RequestBody CustomerInfo customerInfo){
        OperationStatusResponse response = service.saveCustomerInfo(userId, customerInfo);
        return ResponseEntity.ok(response);
    }
}
