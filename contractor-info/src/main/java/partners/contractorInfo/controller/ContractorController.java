package partners.contractorInfo.controller;

import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.contractorInfo.dto.ContractorInfo;
import partners.contractorInfo.dto.GetContractorInfoResponse;
import partners.contractorInfo.dto.OperationStatusResponse;
import partners.contractorInfo.service.ContractorService;

import java.io.IOException;
import java.net.MalformedURLException;

@RestController
@AllArgsConstructor
@RequestMapping("/contractor")
@CrossOrigin
public class ContractorController {

    private final ContractorService contractorService;

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> createContractorInfo(@RequestHeader Long userId, @RequestBody ContractorInfo profile){
        OperationStatusResponse response = contractorService.saveContractorInfo(userId, profile);
        return ResponseEntity.ok(response);
    }

    @GetMapping("")
    public ResponseEntity<GetContractorInfoResponse> getContractorInfo(@RequestHeader Long userId){
        GetContractorInfoResponse response = contractorService.getContractorInfo(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/image")
    public ResponseEntity<Resource> getCompletedImage(@RequestHeader Long userId) throws MalformedURLException {
        Resource image = contractorService.getCompletedImage(userId);
        return ResponseEntity.ok(image);
    }

    @PostMapping("/image")
    public ResponseEntity<OperationStatusResponse> saveCompletedImage(@RequestHeader Long userId, @RequestBody MultipartFile image) throws IOException {
        OperationStatusResponse response = contractorService.saveCompletedImage(userId, image);
        return ResponseEntity.ok(response);
    }

}
