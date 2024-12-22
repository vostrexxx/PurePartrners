package partners.questionnaireInfo.controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.questionnaireInfo.dto.*;
import partners.questionnaireInfo.exception.CantDeleteImageException;
import partners.questionnaireInfo.exception.CantDeleteQuestionnaireException;
import partners.questionnaireInfo.exception.CantUpdateQuestionnaireException;
import partners.questionnaireInfo.service.QuestionnaireService;

import java.io.IOException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/questionnaire")
@Slf4j
public class QuestionnaireController {

    private final QuestionnaireService questionnaireService;

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> saveQuestionnaire(@RequestHeader Long userId, @RequestBody QuestionnaireInfo questionnaire){
        OperationStatusResponse response = questionnaireService.saveQuestionnaire(userId, questionnaire);
        return ResponseEntity.ok(response);
    }

    @GetMapping("")
    public ResponseEntity<GetQuestionnaireInfoResponse> getQuestionnaire(@RequestParam Long questionnaireId){
        GetQuestionnaireInfoResponse response = questionnaireService.getQuestionnaire(questionnaireId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("")
    public ResponseEntity<OperationStatusResponse> deleteQuestionnaire(@RequestParam Long questionnaireId) throws CantDeleteQuestionnaireException {
        OperationStatusResponse response = questionnaireService.deleteQuestionnaire(questionnaireId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{questionnaireId}")
    public ResponseEntity<OperationStatusResponse> updateQuestionnaire(@PathVariable("questionnaireId") Long questionnaireId, @RequestBody QuestionnaireInfo questionnaire) throws CantUpdateQuestionnaireException {
        OperationStatusResponse response = questionnaireService.updateQuestionnaire(questionnaireId, questionnaire);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/image")
    public ResponseEntity<Resource> getImageByPath(@RequestParam String imagePath){
        Resource image = questionnaireService.getImageByPath(imagePath);
        return ResponseEntity.ok(image);
    }

    @PostMapping("/image")
    public ResponseEntity<OperationStatusResponse> saveImages(@RequestBody SaveQuestionnaireImages images) throws IOException {
        OperationStatusResponse response = questionnaireService.saveQuestionnaireImages(images);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/image")
    public ResponseEntity<OperationStatusResponse> deleteImageByPath(@RequestParam String imagePath) throws IOException, CantDeleteImageException {
        OperationStatusResponse response = questionnaireService.deleteImageByPath(imagePath);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/previews")
    public ResponseEntity<GetAllPreviews> getAllQuestionnairesPreviews(@RequestHeader Long userId){
        GetAllPreviews previews = questionnaireService.getAllQuestionnairesPreviews(userId);
        return ResponseEntity.ok(previews);
    }

    @GetMapping("/preview")
    public ResponseEntity<QuestionnairePreview> getPreviewByQuestionnaireId(@RequestParam Long questionnaireId){
        QuestionnairePreview response = questionnaireService.getPreviewByQuestionnaireId(questionnaireId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter")
    public ResponseEntity<GetAllPreviews> filterQuestionnaires(@RequestHeader Long userId, @RequestParam(required = false) String text,
                                                               @RequestParam(required = false) Boolean hasEdu, @RequestParam(required = false) Boolean hasTeam,
                                                               @RequestParam(required = false) Double minPrice, @RequestParam(required = false) Double maxPrice,
                                                               @RequestParam(required = false) Integer minWorkExp){
        GetAllPreviews previews = questionnaireService.filterQuestionnaires(userId, text, hasEdu, hasTeam, minPrice, maxPrice, minWorkExp);
        return ResponseEntity.ok(previews);
    }

}
