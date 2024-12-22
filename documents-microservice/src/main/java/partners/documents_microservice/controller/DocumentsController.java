package partners.documents_microservice.controller;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.documents_microservice.dto.EstimateDTO;
import partners.documents_microservice.dto.OperationStatusResponse;
import partners.documents_microservice.service.DocumentsService;

@RestController
@AllArgsConstructor
@RequestMapping("/document")
public class DocumentsController {
    private final DocumentsService documentsService;

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> getDocumentByAgreementId(@RequestParam Long agreementId) {
        OperationStatusResponse response = documentsService.generateDOCX(agreementId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/estimate")
    public ResponseEntity<OperationStatusResponse> generateExcelEstimate(@RequestBody EstimateDTO estimate){
        OperationStatusResponse response = documentsService.generateExcelEstimate(estimate);
        return ResponseEntity.ok(response);
    }
}
