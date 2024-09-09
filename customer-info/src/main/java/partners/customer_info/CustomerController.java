package partners.customer_info;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@CrossOrigin
@RequestMapping("/customer")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("")
    public ResponseEntity<GetCustomerInfoResponse> getCustomerInfo(@RequestHeader Long userId){
        GetCustomerInfoResponse response = customerService.getCustomerInfo(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<StatusResponse> saveCustomerInfo(@RequestHeader Long userId, @RequestBody CustomerInfo customerInfo){
        StatusResponse response = customerService.saveCustomerInfo(userId, customerInfo);
        return ResponseEntity.ok(response);
    }



}
