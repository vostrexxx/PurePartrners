package partners.change_credentials.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.change_credentials.dto.OperationStatusResponse;
import partners.change_credentials.exception.CantGenerateTokenException;
import partners.change_credentials.exception.NoResetCodeException;
import partners.change_credentials.service.ChangeCredentialsService;
import partners.change_credentials.dto.CompareResetPasswordCodeRequest;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/change")
public class ChangeCredentialsController {

    private final ChangeCredentialsService changeCredentialsService;

    @PostMapping("/newCode")
    public ResponseEntity<OperationStatusResponse> generatePhoneResetCode(@RequestHeader Long userId) throws CantGenerateTokenException {
        OperationStatusResponse response = changeCredentialsService.generatePhoneNumberResetCode(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/code")
    public ResponseEntity<OperationStatusResponse> compareResetPasswordCode(@RequestBody CompareResetPasswordCodeRequest request, @RequestHeader Long userId) throws NoResetCodeException {
        OperationStatusResponse response = changeCredentialsService.compareResetPasswordCode(request.getCode(), userId);
        return ResponseEntity.ok(response);
    }
}
