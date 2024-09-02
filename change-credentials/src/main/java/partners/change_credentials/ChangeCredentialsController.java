package partners.change_credentials;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/change")
public class ChangeCredentialsController {

    private final ChangeCredentialsService changeCredentialsService;

    @PostMapping("/newCode")
    public ResponseEntity<GeneratePhoneResetCodeResponse> generatePhoneResetCode(@RequestHeader Long userId){
        GeneratePhoneResetCodeResponse response = changeCredentialsService.generatePhoneNumberResetCode(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/code")
    public ResponseEntity<CompareResetPasswordCodeResponse> compareResetPasswordCode(@RequestBody CompareResetPasswordCodeRequest request, @RequestHeader Long userId){
        CompareResetPasswordCodeResponse response = changeCredentialsService.compareResetPasswordCode(request.getCode(), userId);
        return ResponseEntity.ok(response);
    }
}
