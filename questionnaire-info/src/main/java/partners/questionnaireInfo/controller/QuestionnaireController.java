package partners.questionnaireInfo.controller;

import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.questionnaireInfo.dto.*;
import partners.questionnaireInfo.service.QuestionnaireService;

import java.io.IOException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/questionnaire")
@CrossOrigin
public class QuestionnaireController {

    private final QuestionnaireService questionnaireService;

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> saveQuestionnaire(@RequestHeader Long userId, @RequestBody QuestionnaireInfo questionnaire){
        OperationStatusResponse response = questionnaireService.saveQuestionnaire(userId, questionnaire);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{questionnaireId}")
    public ResponseEntity<GetQuestionnaireInfoResponse> getQuestionnaire(@PathVariable("questionnaireId") Long questionnaireId){
        GetQuestionnaireInfoResponse response = questionnaireService.getQuestionnaire(questionnaireId);
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
    public ResponseEntity<OperationStatusResponse> deleteImageByPath(@RequestParam String imagePath) throws IOException {
        OperationStatusResponse response = questionnaireService.deleteImageByPath(imagePath);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/preview")
    public ResponseEntity<GetAllPreviews> getAllQuestionnairesPreviews(@RequestHeader Long userId){
        GetAllPreviews previews = questionnaireService.getAllQuestionnairesPreviews(userId);
        return ResponseEntity.ok(previews);
    }

}
