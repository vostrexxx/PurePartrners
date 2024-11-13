package partners.agreement_connection_info.controller;

import lombok.AllArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.agreement_connection_info.dto.AgreementInfo;
import partners.agreement_connection_info.dto.AllUserAgreements;
import partners.agreement_connection_info.dto.OperationStatusResponse;
import partners.agreement_connection_info.dto.UpdateAgreementInfo;
import partners.agreement_connection_info.service.AgreementService;

@RestController
@AllArgsConstructor
@RequestMapping("/agreement")
@CrossOrigin
public class AgreementController {
    private final AgreementService agreementService;

    //TODO controller
    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> createNotConfirmedAgreement(@RequestHeader Long userId, @RequestBody AgreementInfo agreementInfo){
        OperationStatusResponse response = agreementService.createAgreement(userId, agreementInfo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/notifications")
    public ResponseEntity<AllUserAgreements> getUserNotifications(@RequestHeader Long userId) {
        AllUserAgreements response = agreementService.getALlUserAgreements(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("")
    public ResponseEntity<OperationStatusResponse> updateAgreement(@RequestBody UpdateAgreementInfo updateAgreementInfo){
        OperationStatusResponse response = agreementService.updateAgreement(updateAgreementInfo);
        return ResponseEntity.ok(response);
    }
}
