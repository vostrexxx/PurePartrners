package partners.Categories_of_work_info.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.Categories_of_work_info.dto.*;
import partners.Categories_of_work_info.service.CategoriesService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/categories")
public class CategoriesController {
    private final CategoriesService service;

    @GetMapping("/search")
    public ResponseEntity<SearchCategoriesWithRelatedResponse> searchCategories(@RequestParam(required = false) String searchText){
        SearchCategoriesWithRelatedResponse response = service.searchCategoriesWithRelated(searchText);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/estimate")
    public ResponseEntity<OperationStatusResponse> saveEstimate(@RequestBody SaveEstimateRequest request){
        OperationStatusResponse response = service.saveEstimate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/estimate")
    public ResponseEntity<EstimateResponse> getEstimateByAgreementId(@RequestParam Long agreementId){
        EstimateResponse response = service.getEstimateByAgreementId(agreementId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/estimate")
    public ResponseEntity<OperationStatusResponse> updateEstimate(@RequestBody ProcessEstimateChangeCardRequest changes){
        OperationStatusResponse response = service.updateEstimate(changes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/is-editing")
    public ResponseEntity<IsEditingResponse> getIsEditing(@RequestParam Long agreementId, @RequestHeader Long userId){
        IsEditingResponse response = service.getIsEditing(agreementId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/is-editing")
    public ResponseEntity<OperationStatusResponse> updateIsEditing(@RequestBody IsEditingDTO isEditingDTO){
        OperationStatusResponse response = service.updateIsEditing(isEditingDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/changes")
    public ResponseEntity<OperationStatusResponse> saveSuggestedChanges(@RequestBody EstimateChangesRequest request){
        OperationStatusResponse response = service.saveSuggestedChanges(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/changes")
    public ResponseEntity<EstimateChangesResponse> getSuggestedChanges(@RequestParam Long agreementId, @RequestHeader Long userId){
        EstimateChangesResponse response = service.getSuggestedChanges(agreementId, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/changes")
    public ResponseEntity<OperationStatusResponse> deleteSuggestedChanges(@RequestParam Long id){
        OperationStatusResponse response = service.deleteChangeById(id);
        return ResponseEntity.ok(response);
    }
}
