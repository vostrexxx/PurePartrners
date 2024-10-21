package partners.questionnaireInfo.service;

import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.FileSystemResource;
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
import java.nio.file.Files;
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

        //Получение изображений для анкеты
        String questionnaireImagePath = Constants.KEY_DEFAULT_IMAGES_PATH + questionnaireId;
        File directory = new File(questionnaireImagePath);
        List<String> questionnaireImages = new ArrayList<>();
        if (directory.exists() && directory.isDirectory() && directory.list().length > 0) {
            for (File file : directory.listFiles()){
                if (file.isFile()){
                    String imagePath = questionnaireId + file.getName();
                    questionnaireImages.add(imagePath);
                }
            }
        } else
            questionnaireImages = null;

        questionnaireInfo.setQuestionnaireImages(questionnaireImages);
        return new GetQuestionnaireInfoResponse(1, questionnaireInfo);
    }

    public Resource getImageByPath(String imagePath){
        String fullImagePath = Constants.KEY_DEFAULT_IMAGES_PATH + imagePath;
        File file = new File(fullImagePath);
        if (file.exists()){
            return new FileSystemResource(file);
        } else
            return null;
    }

    public OperationStatusResponse deleteImageByPath(String imagePath) throws IOException {
        String fullImagePath = Constants.KEY_DEFAULT_IMAGES_PATH + imagePath;
        File file = new File(fullImagePath);
        boolean success = Files.deleteIfExists(file.toPath());
        if (success)
            return new OperationStatusResponse(1);
        else
            return new OperationStatusResponse(0);
    }

    public OperationStatusResponse saveQuestionnaireImages(SaveQuestionnaireImages images) throws IOException {
        Long questionnaireId = images.getQuestionnaireId();
        MultipartFile[] questionnaireImages = images.getQuestionnaireImages();

        for (int i = 0; i < questionnaireImages.length; i++){
            String imagePath = Constants.KEY_DEFAULT_IMAGES_PATH + questionnaireId;
            File directory = new File(imagePath);
            if (!directory.exists())
                directory.mkdirs();
            imagePath += "/" + i + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
            File userImage = new File(imagePath);
            questionnaireImages[i].transferTo(userImage.toPath());
            File checkFile = new File(imagePath);
            if (!checkFile.isFile())
                return new OperationStatusResponse(0);
        }
        return new OperationStatusResponse(1);
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

    public GetAllPreviews filterQuestionnaires(Long userId){
        List<Questionnaire> previews = questionnaireRepository.findAllByUserIdNot(userId);
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
