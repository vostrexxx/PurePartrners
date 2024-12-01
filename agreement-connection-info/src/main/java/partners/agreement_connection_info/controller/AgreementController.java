package partners.agreement_connection_info.controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.agreement_connection_info.dto.*;
import partners.agreement_connection_info.service.AgreementService;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/agreement")
public class AgreementController {
    private final AgreementService agreementService;

    //TODO controller
    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> createNotConfirmedAgreement(@RequestHeader Long userId, @RequestBody AgreementInfo agreementInfo){
        OperationStatusResponse response = agreementService.createAgreement(userId, agreementInfo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sent")
    public ResponseEntity<AllUserAgreements> getSentAgreements(@RequestHeader Long userId, @RequestParam int mode) {
        AllUserAgreements response = agreementService.getUserAgreementsByMode(userId, true, mode);
        log.info("All agreements " + response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/received")
    public ResponseEntity<AllUserAgreements> getReceivedAgreements(@RequestHeader Long userId, @RequestParam int mode) {
        AllUserAgreements response = agreementService.getUserAgreementsByMode(userId, false, mode);
        log.info("All agreements " + response);
        return ResponseEntity.ok(response);
    }

    @PutMapping("")
    public ResponseEntity<OperationStatusResponse> updateAgreement(@RequestBody UpdateAgreementInfo updateAgreementInfo){
        OperationStatusResponse response = agreementService.updateAgreement(updateAgreementInfo);
        return ResponseEntity.ok(response);
    }
}
