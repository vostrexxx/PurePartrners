package partners.contractorInfo;

import jakarta.ws.rs.HeaderParam;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;

@RestController
@AllArgsConstructor
@RequestMapping("/contractor")
@CrossOrigin
public class ContractorController {

    private final ContractorService contractorService;

    @PostMapping("")
    public ResponseEntity<SaveContractorInfoResponse> createContractorInfo(@RequestHeader Long userId, @RequestBody ContractorInfo profile){
        SaveContractorInfoResponse response = contractorService.saveContractorInfo(userId, profile);
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
    public ResponseEntity<SaveCompletedImageResponse> saveCompletedImage(@RequestHeader Long userId, @RequestBody MultipartFile image) throws IOException {
        SaveCompletedImageResponse response = contractorService.saveCompletedImage(userId, image);
        return ResponseEntity.ok(response);
    }

}
