package partners.questionnaireInfo.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.modelmapper.ModelMapper;
import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
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
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
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
        List<String> questionnaireImages = new ArrayList<>();

//        try (Stream<Path> paths = Files.list(Path.of(questionnaireImagePath))){
//            questionnaireImages = paths
//                    .filter(Files::isRegularFile)
//                    .map(path -> questionnaireId + path.getFileName().toString())
//                    .collect(Collectors.toList());
//        } catch (IOException e) {
//            e.printStackTrace();
//            questionnaireImages = null;
//        }
//        if (directory.exists() && directory.isDirectory() && directory.list().length > 0) {
//            for (File file : directory.listFiles()){
//                if (file.isFile()){
//                    String imagePath = questionnaireId + file.getName();
//                    questionnaireImages.add(imagePath);
//                }
//            }
//        } else
//            questionnaireImages = null;

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
            Files.createDirectory(Path.of(imagePath));
            imagePath += "/" + i + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
            Path anotherImagePath = Path.of(imagePath);
            questionnaireImages[i].transferTo(anotherImagePath);
            if (!Files.exists(anotherImagePath))
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
        return new GetAllPreviews(1, questionnairePreviews);
    }

    public OperationStatusResponse deleteQuestionnaire(Long questionnaireId){
        if (questionnaireRepository.existsById(questionnaireId)) {
            questionnaireRepository.deleteById(questionnaireId);
            return new OperationStatusResponse(1);
        } else
            return new OperationStatusResponse(0);
    }

    public OperationStatusResponse updateQuestionnaire(Long questionnaireId, QuestionnaireInfo questionnaireInfo){
        Questionnaire questionnaire = questionnaireRepository.getReferenceById(questionnaireId);
        questionnaire.setCategoriesOfWork(questionnaireInfo.getCategoriesOfWork());
        questionnaire.setHasTeam(questionnaireInfo.getHasTeam());
        questionnaire.setTeam(questionnaireInfo.getTeam());
        questionnaire.setHasEdu(questionnaireInfo.getHasEdu());
        questionnaire.setEduEst(questionnaireInfo.getEduEst());
        questionnaire.setEduDateStart(questionnaireInfo.getEduDateStart());
        questionnaire.setEduDateEnd(questionnaireInfo.getEduDateEnd());
        questionnaire.setWorkExp(questionnaireInfo.getWorkExp());
        questionnaire.setSelfInfo(questionnaireInfo.getSelfInfo());
        questionnaire.setPrices(questionnaireInfo.getPrices());
        questionnaireRepository.save(questionnaire);
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
                                .fields("selfInfo", "eduEst", "team", "categoriesOfWork")
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
