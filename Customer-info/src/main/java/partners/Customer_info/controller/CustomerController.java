package partners.Customer_info.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.Customer_info.dto.CustomerInfoDTO;
import partners.Customer_info.service.CustomerService;

@RestController
@AllArgsConstructor
@CrossOrigin
@RequestMapping("/customer")
public class CustomerController {
    private final CustomerService service;

    @GetMapping("")
    public ResponseEntity<CustomerInfoDTO> getCustomerInfo(@RequestParam Long userId){
        CustomerInfoDTO response = service.getCustomerInfo(userId);
        return ResponseEntity.ok(response);
    }
}
