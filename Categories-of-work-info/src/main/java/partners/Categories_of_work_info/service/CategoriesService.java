package partners.Categories_of_work_info.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.NotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import partners.Categories_of_work_info.dto.*;
import partners.Categories_of_work_info.model.*;
import partners.Categories_of_work_info.repository.*;

import java.lang.reflect.Field;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class CategoriesService {
    private final CategoriesRepository categoriesRepository;
    private final ModelMapper modelMapper;
    private final SubSubWorkCategoryRepository subSubWorkCategoryRepository;
    private final SubWorkCategoryRepository subWorkCategoryRepository;
    private final IsEditingRepository isEditingRepository;
    private final EstimateChangesRepository estimateChangesRepository;

    @Transactional
    public SearchCategoriesWithRelatedResponse searchCategoriesWithRelated(String searchText) {
        if (searchText == null || searchText.isEmpty()) {
            searchText = "start";
        }
        String rawTextSearch = searchText;
        searchText += "*";
        List<CategoryWithSubCategories> categories = null;
        try {
            categories = categoriesRepository.findNodeWithRelated(searchText);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
        log.info("ЧО ПОЛУЧИЛИ: {}", categories.toString());
        List<String> resultNodes = getResultNodes(searchText, categories, rawTextSearch);
        return new SearchCategoriesWithRelatedResponse(1, resultNodes);
    }

    private static List<String> getResultNodes(String searchText, List<CategoryWithSubCategories> categories, String rawTextSearch) {
        List<String> resultNodes = new ArrayList<>();
        for (CategoryWithSubCategories category : categories) {
            Category mainNode = category.getNode();
            List<Category> relatedNodes = category.getChildren();

            String mainNodeName = mainNode.getName();
            if (!searchText.equals("start*") && !mainNodeName.equals(rawTextSearch))
                resultNodes.add(mainNodeName);

            if (!searchText.equals("start*")) {
                for (Category relatedNode : relatedNodes) {
                    String relatedNodeName = relatedNode.getName();
                    resultNodes.add(mainNodeName + " " + relatedNodeName);
                }
            } else {
                for (Category relatedNode : relatedNodes) {
                    String relatedNodeName = relatedNode.getName();
                    resultNodes.add(relatedNodeName);
                }
            }
        }
        return resultNodes;
    }

    public OperationStatusResponse saveEstimate(SaveEstimateRequest saveEstimateRequest) {
        Long agreementId = saveEstimateRequest.getAgreementId();
        List<SubWorkCategoryDTO> estimate = saveEstimateRequest.getEstimate();
        for (SubWorkCategoryDTO category : estimate) {
            SubWorkCategory subWorkCategoryForSave = new SubWorkCategory();
            try {
                subWorkCategoryForSave.setSubWorkCategoryName(category.getSubWorkCategoryName());
                if (category.getSubSubWorkCategories() != null) {
                    List<SubSubWorkCategory> savedSubSubWorkCategories = new ArrayList<>();
                    for (SubSubWorkCategoryDTO subSubWorkCategory : category.getSubSubWorkCategories()){
                        SubSubWorkCategory subSubWorkCategoryForSave = modelMapper.map(subSubWorkCategory, SubSubWorkCategory.class);
                        subSubWorkCategoryForSave.setElementId(UUID.randomUUID().toString());
                        SubSubWorkCategory savedSubSubWorkCategory = subSubWorkCategoryRepository.save(subSubWorkCategoryForSave);
                        log.info("Сохранил подкатегорию: {}", savedSubSubWorkCategory);
                        savedSubSubWorkCategories.add(savedSubSubWorkCategory);
                    }
                    subWorkCategoryForSave.setSubSubWorkCategories(savedSubSubWorkCategories);
                }
                subWorkCategoryForSave.setAgreementId(agreementId);
                subWorkCategoryForSave.setElementId(UUID.randomUUID().toString());
                subWorkCategoryRepository.save(subWorkCategoryForSave);
                log.info("Сохранил категорию: {}", subWorkCategoryForSave);
            } catch (Exception e) {
                log.error(e.getMessage());
                throw new InternalServerErrorException(e.getMessage());
            }
        }
        return new OperationStatusResponse(1);
    }

    public EstimateResponse getEstimateByAgreementId(Long agreementId) {
        List<SubWorkCategory> estimate = subWorkCategoryRepository.findAllByAgreementId(agreementId);
        List<SubWorkCategoryDTO> responseEstimate = estimate.stream()
                .map(this::mapSubWorkCategories)
                .toList();
        log.info("Полученный estimate: {}", responseEstimate);
        return new EstimateResponse(responseEstimate);
    }

    private SubWorkCategoryDTO mapSubWorkCategories(SubWorkCategory subWorkCategory) {
        SubWorkCategoryDTO subWorkCategoryDTO = modelMapper.map(subWorkCategory, SubWorkCategoryDTO.class);

        List<SubSubWorkCategoryDTO> subCategories = subWorkCategory.getSubSubWorkCategories().stream()
                .map(category -> modelMapper.map(category, SubSubWorkCategoryDTO.class))
                .toList();

        subWorkCategoryDTO.setSubSubWorkCategories(subCategories);
        return subWorkCategoryDTO;
    }

    @Transactional
    public OperationStatusResponse updateEstimate(ProcessEstimateChangeCardRequest changes) {
        log.info("Пришли запросы: {}", changes);
        NodeUpdateRequest change = changes.getChanges();
        switch (change.getOperation()) {
            case "update": {
                processUpdate(change);
                break;
            }
            case "add": {
                processAdd(change, changes.getAgreementId());
                break;
            }
            case "delete":{
                processDelete(change);
                break;
            }
            default: {
                throw new InternalServerErrorException("Неправильный тип операции");
            }
        }
        estimateChangesRepository.deleteById(change.getId());
        return new OperationStatusResponse(1);
    }

    private void processUpdate(NodeUpdateRequest updateRequest) {
        try {
            if (updateRequest.getType().equals(1)){
                subWorkCategoryRepository.findByElementId(updateRequest.getElementId()).ifPresent(node -> {
                    updateFields(node, updateRequest.getUpdatedFields());
                    subWorkCategoryRepository.save(node);
                });
            } else if (updateRequest.getType().equals(2)){
                subSubWorkCategoryRepository.findByElementId(updateRequest.getElementId()).ifPresent(node -> {
                    updateFields(node, updateRequest.getUpdatedFields());
                    subSubWorkCategoryRepository.save(node);
                });
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
    }

    private void processAdd(NodeUpdateRequest updateRequest, Long agreementId) {
        try {
            switch (updateRequest.getType()){
                case 1: {
                    SubWorkCategory subWorkCategory = new SubWorkCategory();
                    updateFields(subWorkCategory, updateRequest.getUpdatedFields());
                    if (updateRequest.getSubSubCategories() != null) {
                        List<SubSubWorkCategory> subSubWorkCategoriesToSave = updateRequest.getSubSubCategories().stream()
                                .map(data -> {
                                    SubSubWorkCategory subSubWorkCategory = new SubSubWorkCategory();
                                    updateFields(subSubWorkCategory, data);
                                    subSubWorkCategory.setElementId(UUID.randomUUID().toString());
                                    return subSubWorkCategory;
                                })
                                .toList();
                        subWorkCategory.setSubSubWorkCategories(subSubWorkCategoriesToSave);

                        subSubWorkCategoryRepository.saveAll(subSubWorkCategoriesToSave);
                    }
                    subWorkCategory.setElementId(UUID.randomUUID().toString());
                    subWorkCategory.setAgreementId(agreementId);
                    subWorkCategoryRepository.save(subWorkCategory);
                    break;
                }
                case 2: {
                    subWorkCategoryRepository.findByElementId(updateRequest.getParentId()).ifPresent(parentNode -> {
                        Map<String, Object> subSubWorkCategoryFields = updateRequest.getUpdatedFields();
                        SubSubWorkCategory subSubWorkCategory = new SubSubWorkCategory();
                        updateFields(subSubWorkCategory, subSubWorkCategoryFields);
                        subSubWorkCategory.setElementId(UUID.randomUUID().toString());
                        if (parentNode.getSubSubWorkCategories() == null) {
                            parentNode.setSubSubWorkCategories(new ArrayList<>());
                        }
                        parentNode.getSubSubWorkCategories().add(subSubWorkCategory);

                        subSubWorkCategoryRepository.save(subSubWorkCategory);

                        subWorkCategoryRepository.save(parentNode);
                    });
                    break;
                }
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
    }

    private void processDelete(NodeUpdateRequest updateRequest) {
        try {
            switch (updateRequest.getType()){
                case 1: {
                    log.info("Надо удалить такой айдишник: {}", updateRequest.getElementId());
                    subWorkCategoryRepository.detachDeleteByElementId(updateRequest.getElementId());
                    break;
                }
                case 2: {
                    subSubWorkCategoryRepository.detachDeleteByElementId(updateRequest.getElementId());
                    break;
                }
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
    }

    private void updateFields(Object node, Map<String, Object> updateFields){
        updateFields.forEach((key, value) -> {
            try {
                Field field = node.getClass().getDeclaredField(key);
                Class<?> fieldType = field.getType();

                if (fieldType.equals(Long.class) && value instanceof Integer) {
                    value = ((Integer) value).longValue();
                }
                // Обработка для Double
                if (fieldType.equals(Double.class) && value instanceof String) {
                    value = value.toString().isEmpty() ? 0.0 : Double.parseDouble((String) value);
                }

                // Обработка для String
                if (fieldType.equals(String.class) && value instanceof String) {
                    value = value.toString().isEmpty() ? "" : value;
                }
                field.setAccessible(true);
                field.set(node, value);
            } catch (NoSuchFieldException | IllegalAccessException e) {
                log.error(e.getMessage());
                throw new RuntimeException(e);
            }
        });
    }

    public IsEditingResponse getIsEditing(Long agreementId, Long userId){
        IsEditing isEditing = isEditingRepository.findByAgreementId(agreementId)
                .orElse(null);
        if (isEditing == null || isEditing.getIsEditing() == null)
            return new IsEditingResponse(null);
        if (!isEditing.getIsEditing() && Objects.equals(isEditing.getInitiatorId(), userId)){
            return new IsEditingResponse(true);
        } else
            return new IsEditingResponse(isEditing.getIsEditing());
    }

    public OperationStatusResponse updateIsEditing(IsEditingDTO isEditingDTO){
        IsEditing isEditing = isEditingRepository.findByAgreementId(isEditingDTO.getAgreementId())
                .orElse(new IsEditing());
        if (isEditingDTO.getIsEditing() != null)
            isEditingDTO.setIsEditing(!isEditingDTO.getIsEditing());
        isEditing.setIsEditing(isEditingDTO.getIsEditing());
        isEditing.setInitiatorId(isEditingDTO.getInitiatorId());
        isEditing.setAgreementId(isEditingDTO.getAgreementId());
        try {
            isEditingRepository.save(isEditing);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
        return new OperationStatusResponse(1);
    }

    public OperationStatusResponse saveSuggestedChanges(EstimateChangesRequest changes){
        for (NodeUpdateRequest updateRequest : changes.getChanges()) {
            EstimateChanges estimateChanges = modelMapper.map(updateRequest, EstimateChanges.class);
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                estimateChanges.setUpdatedFields(objectMapper.writeValueAsString(updateRequest.getUpdatedFields()));
                estimateChanges.setSubSubCategories(objectMapper.writeValueAsString(updateRequest.getSubSubCategories()));
            } catch (JsonProcessingException e) {
                log.error(e.getMessage());
                throw new InternalServerErrorException(e.getMessage());
            }
            estimateChanges.setAgreementId(changes.getAgreementId());
            estimateChanges.setInitiatorId(changes.getInitiatorId());
            estimateChangesRepository.save(estimateChanges);
        }
        return new OperationStatusResponse(1);
    }

    public EstimateChangesResponse getSuggestedChanges(Long agreementId, Long userId){
        List<EstimateChanges> estimateChanges = estimateChangesRepository.findAllByAgreementId(agreementId);
        ObjectMapper objectMapper = new ObjectMapper();
        List<NodeUpdateRequest> changes = estimateChanges.stream()
                .map(change -> {
                    NodeUpdateRequest updateRequest = modelMapper.map(change, NodeUpdateRequest.class);
                    try {
                        updateRequest.setUpdatedFields(objectMapper.readValue(change.getUpdatedFields(), new TypeReference<>() {
                        }));
                        updateRequest.setSubSubCategories(objectMapper.readValue(change.getSubSubCategories(), new TypeReference<>() {
                        }));
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                    updateRequest.setId(change.getId());
                    return updateRequest;
                })
                .toList();
        return new EstimateChangesResponse(changes);
    }

    public OperationStatusResponse deleteChangeById(Long id){
        if (estimateChangesRepository.existsById(id))
            estimateChangesRepository.deleteById(id);
        else {
            log.error("Изменение не найдено");
            throw new NotFoundException("Изменение не найдено");
        }
        return new OperationStatusResponse(1);
    }
}
