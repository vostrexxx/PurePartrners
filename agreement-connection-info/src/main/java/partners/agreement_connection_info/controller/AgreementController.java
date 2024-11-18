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

    @GetMapping("/sent")
    public ResponseEntity<AllUserAgreements> getSentAgreements(@RequestHeader Long userId) {
        AllUserAgreements response = agreementService.getUserAgreementsByMode(userId, true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/received")
    public ResponseEntity<AllUserAgreements> getReceivedAgreements(@RequestHeader Long userId) {
        AllUserAgreements response = agreementService.getUserAgreementsByMode(userId, false);
        return ResponseEntity.ok(response);
    }

    @PutMapping("")
    public ResponseEntity<OperationStatusResponse> updateAgreement(@RequestBody UpdateAgreementInfo updateAgreementInfo){
        OperationStatusResponse response = agreementService.updateAgreement(updateAgreementInfo);
        return ResponseEntity.ok(response);
    }
}
