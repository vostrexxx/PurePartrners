package partners.questionnaireInfo.service;

import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;
import partners.questionnaireInfo.config.Constants;
import partners.questionnaireInfo.dto.*;
import partners.questionnaireInfo.model.Questionnaire;
import partners.questionnaireInfo.repository.QuestionnaireRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class QuestionnaireService {

    private final QuestionnaireRepository questionnaireRepository;
    private final ModelMapper modelMapper = new ModelMapper();

    public OperationStatusResponse saveQuestionnaire(Long userId, QuestionnaireInfo questionnaireInfo){

        Questionnaire questionnaire = modelMapper.map(questionnaireInfo, Questionnaire.class);
        questionnaire.setUserId(userId);
        try {
            questionnaireRepository.save(questionnaire);
            return new OperationStatusResponse(1);
        } catch (Exception e){
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_CONTRACTOR);
        }
    }

    public GetQuestionnaireInfoResponse getQuestionnaire(Long questionnaireId){
        Optional<Questionnaire> contractor = questionnaireRepository.findById(questionnaireId);
        if (contractor.isEmpty())
            return new GetQuestionnaireInfoResponse(0, null);
        Questionnaire actualQuestionnaireData = contractor.get();
        QuestionnaireInfo questionnaireInfo = modelMapper.map(actualQuestionnaireData, QuestionnaireInfo.class);
        return new GetQuestionnaireInfoResponse(1, questionnaireInfo);
    }

    public GetImageResponse getCompletedImage(Long userId) throws IOException {
        Path firstImagePath = Path.of(Constants.KEY_IMAGES_PATH + userId + Constants.KEY_IMAGES_DEFAULT_EXTENSION);
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {    
            Resource resource = new UrlResource(firstImagePath.toUri());
            byte[] image =StreamUtils.copyToByteArray(resource.getInputStream());
            return new GetImageResponse(1, image);
        }
        else
            return new GetImageResponse(0, null);
    }

    public OperationStatusResponse saveCompletedImage(Long userId, MultipartFile image) throws IOException {
        String imagePath = Constants.KEY_IMAGES_PATH + userId + Constants.KEY_IMAGES_DEFAULT_EXTENSION;
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new OperationStatusResponse(1);
        else
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_IMAGE);
    }

    public GetAllPreviews getAllQuestionnairesPreviews(Long userId){
        List<Questionnaire> previews = questionnaireRepository.findAllByUserId(userId);
        List<QuestionnairePreview> questionnairePreviews = new ArrayList<>();
        for (Questionnaire questionnaire : previews) {
            QuestionnairePreview questionnairePreview = modelMapper.map(questionnaire, QuestionnairePreview.class);
            questionnairePreviews.add(questionnairePreview);
        }
        if (previews.isEmpty())
            return new GetAllPreviews(0, null);
        return new GetAllPreviews(1, questionnairePreviews);
    }

}
