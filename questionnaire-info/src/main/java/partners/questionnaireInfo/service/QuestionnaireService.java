package partners.questionnaireInfo.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.NotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.modelmapper.ModelMapper;
import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;
import partners.questionnaireInfo.config.Constants;
import partners.questionnaireInfo.dto.*;
import partners.questionnaireInfo.exception.CantDeleteImageException;
import partners.questionnaireInfo.exception.CantDeleteQuestionnaireException;
import partners.questionnaireInfo.exception.CantUpdateQuestionnaireException;
import partners.questionnaireInfo.model.Questionnaire;
import partners.questionnaireInfo.repository.QuestionnaireRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
@Slf4j
public class QuestionnaireService {

    private final QuestionnaireRepository questionnaireRepository;
    private final ModelMapper modelMapper = new ModelMapper();
    private final EntityManager entityManager;

    public OperationStatusResponse saveQuestionnaire(Long userId, QuestionnaireInfo questionnaireInfo){

        Questionnaire questionnaire = modelMapper.map(questionnaireInfo, Questionnaire.class);
        questionnaire.setUserId(userId);
        try {
            questionnaireRepository.save(questionnaire);
            return new OperationStatusResponse(1);
        } catch (Exception e){
            log.error(e.getMessage());
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

        if (directory.exists() && directory.isDirectory() && directory.listFiles() != null) {
            questionnaireImages = Arrays.stream(directory.listFiles())
                    .filter(File::isFile)
                    .map(file -> questionnaireId + file.getName())
                    .collect(Collectors.toList());
        }

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

    public OperationStatusResponse deleteImageByPath(String imagePath) throws IOException, CantDeleteImageException {
        String fullImagePath = Constants.KEY_DEFAULT_IMAGES_PATH + imagePath;
        if (Files.deleteIfExists(Path.of(fullImagePath)))
            return new OperationStatusResponse(1);
        else {
            log.error(Constants.KEY_EXCEPTION_CANT_DELETE_IMAGE);
            throw new CantDeleteImageException(Constants.KEY_EXCEPTION_CANT_DELETE_IMAGE, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public OperationStatusResponse saveQuestionnaireImages(SaveQuestionnaireImages images) throws IOException {
        Long questionnaireId = images.getQuestionnaireId();
        MultipartFile[] questionnaireImages = images.getQuestionnaireImages();

        for (int i = 0; i < questionnaireImages.length; i++){
            String imagePath = Constants.KEY_DEFAULT_IMAGES_PATH + questionnaireId;
            Files.createDirectory(Path.of(imagePath));
            imagePath += "/" + i + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
            Path anotherImagePath = Path.of(imagePath);
            questionnaireImages[i].transferTo(anotherImagePath);
            if (!Files.exists(anotherImagePath)) {
                log.error(Constants.KEY_EXCEPTION_CANT_SAVE_IMAGE);
                throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_IMAGE);
            }
        }
        return new OperationStatusResponse(1);
    }

    public GetAllPreviews getAllQuestionnairesPreviews(Long userId){
        List<Questionnaire> previews = questionnaireRepository.findAllByUserId(userId);
        List<QuestionnairePreview> questionnairePreviews = previews.stream()
                .map(questionnaire -> modelMapper.map(questionnaire, QuestionnairePreview.class))
                .collect(Collectors.toList());
        return new GetAllPreviews(1, questionnairePreviews);
    }

    public QuestionnairePreview getPreviewByQuestionnaireId(Long questionnaireId){
        Questionnaire questionnaire = questionnaireRepository.findById(questionnaireId)
                .orElseThrow(NotFoundException::new);
        try {
            return modelMapper.map(questionnaire, QuestionnairePreview.class);
        } catch (Exception e){
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
    }

    public OperationStatusResponse deleteQuestionnaire(Long questionnaireId) throws CantDeleteQuestionnaireException {
        if (questionnaireRepository.existsById(questionnaireId)) {
            questionnaireRepository.deleteById(questionnaireId);
            return new OperationStatusResponse(1);
        } else {
            log.error(Constants.KEY_EXCEPTION_NO_QUESTIONNAIRE);
            throw new CantDeleteQuestionnaireException(Constants.KEY_EXCEPTION_NO_QUESTIONNAIRE, HttpStatus.NOT_FOUND);
        }
    }

    public OperationStatusResponse updateQuestionnaire(Long questionnaireId, QuestionnaireInfo questionnaireInfo) throws CantUpdateQuestionnaireException {

        try {
            Questionnaire questionnaire = questionnaireRepository.getReferenceById(questionnaireId);
            questionnaire.setWorkCategories(questionnaireInfo.getWorkCategories());
            questionnaire.setHasTeam(questionnaireInfo.getHasTeam());
            questionnaire.setTeam(questionnaireInfo.getTeam());
            questionnaire.setSelfInfo(questionnaireInfo.getSelfInfo());
            questionnaire.setPrices(questionnaireInfo.getPrices());
            questionnaireRepository.save(questionnaire);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new CantUpdateQuestionnaireException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new OperationStatusResponse(1);
    }


    @Transactional
    public GetAllPreviews filterQuestionnaires(Long userId, String text,
                                               Boolean hasEdu, Boolean hasTeam,
                                               Double minPrice, Double maxPrice,
                                               Integer minWorkExp) {
        SearchSession session = Search.session(entityManager);
        List<QuestionnairePreview> finalFilteredResult;
        List<Questionnaire> result = session.search(Questionnaire.class)
                .where(f -> {
                    var query = f.bool();

                    // Проверка на полнотекстовый поиск
                    if (text != null && !text.isEmpty()) {
                        query.must(f.match()
                                .fields("selfInfo", "eduEst", "team", "workCategories")
                                .matching(text));
                    }

                    // Проверка на фильтры, если они заданы
                    boolean hasFilters = false;
                    if (hasEdu != null) {
                        query.filter(f.match()
                                .field("hasEdu")
                                .matching(hasEdu));
                        hasFilters = true;
                    }

                    if (hasTeam != null) {
                        query.filter(f.match()
                                .field("hasTeam")
                                .matching(hasTeam));
                        hasFilters = true;
                    }

                    if (minPrice != null || maxPrice != null) {
                        if (minPrice != null && maxPrice != null) {
                            query.filter(f.range()
                                    .field("prices")
                                    .between(minPrice, maxPrice));
                        } else if (minPrice != null) {
                            query.filter(f.range()
                                    .field("prices")
                                    .atLeast(minPrice));
                        } else {
                            query.filter(f.range()
                                    .field("prices")
                                    .atMost(maxPrice));
                        }
                        hasFilters = true;
                    }

                    if (minWorkExp != null) {
                        query.filter(f.range()
                                .field("workExp")
                                .atLeast(minWorkExp));
                        hasFilters = true;
                    }

                    // Если нет ни текста, ни фильтров, возвращаем все записи
                    if (!hasFilters && (text == null || text.isEmpty())) {
                        query.must(f.matchAll());  // Добавляем matchAll для возвращения всех записей
                    }

                    return query;
                })
                .fetchHits(20);

        finalFilteredResult = result.stream()
                .filter(questionnaire -> !questionnaire.getUserId().equals(userId))
                .map(questionnaire -> modelMapper.map(questionnaire, QuestionnairePreview.class))
                .toList();

        return new GetAllPreviews(1, finalFilteredResult);
    }
}
