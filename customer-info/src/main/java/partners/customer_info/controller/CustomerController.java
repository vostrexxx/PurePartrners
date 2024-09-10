package partners.customer_info.controller;

import partners.customer_info.dto.GetCustomerInfoResponse;
import partners.customer_info.dto.OperationStatusResponse;
import partners.customer_info.service.CustomerService;

@RestController
@AllArgsConstructor
@CrossOrigin
@RequestMapping("/customer")
public class CustomerController {
    private CustomerService service;

    @GetMapping("")
    public ResponseEntity<GetCustomerInfoResponse> getCustomerInfo(@RequestHeader Long userId){
        GetCustomerInfoResponse response = customerService.getCustomerInfo(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> saveCustomerInfo(@RequestHeader Long userId, @RequestBody Customer customer){
        OperationStatusResponse response = customerService.saveCustomerInfo(userId, customer);
        return ResponseEntity.ok(response);
    }
}
