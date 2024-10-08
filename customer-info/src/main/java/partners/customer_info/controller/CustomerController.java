package partners.customer_info.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.customer_info.dto.*;
import partners.customer_info.service.CustomerService;

import java.io.IOException;

@RestController
@AllArgsConstructor
@CrossOrigin
@RequestMapping("/customer")
public class CustomerController {
    private final CustomerService service;

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

    @GetMapping("/image")
    public ResponseEntity<GetImageResponse> getCustomerImage(@RequestHeader Long userId) throws IOException{
        GetImageResponse image = service.getCustomerImage(userId);
        return ResponseEntity.ok(image);
    }

    @PostMapping("/image")
    public ResponseEntity<OperationStatusResponse> saveCustomerImage(@RequestHeader Long userId, @RequestBody MultipartFile image) throws IOException {
        OperationStatusResponse response = service.saveCustomerImage(userId, image);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/image/delete")
    public ResponseEntity<OperationStatusResponse> deleteCustomerImage(@RequestHeader Long userId){
        OperationStatusResponse response = service.deleteCustomerImage(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/preview")
    public ResponseEntity<GetAllPreviews> getAllPreviews(@RequestHeader Long userId){
        GetAllPreviews response = service.getAllPreviews(userId);
        return ResponseEntity.ok(response);
    }
}
