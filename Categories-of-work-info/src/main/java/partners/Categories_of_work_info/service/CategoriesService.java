package partners.Categories_of_work_info.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.types.Node;
import org.springframework.stereotype.Service;
import partners.Categories_of_work_info.dto.CategoryWithSubCategories;
import partners.Categories_of_work_info.dto.NextSubCategoryResponse;
import partners.Categories_of_work_info.dto.SearchCategoriesWithRelatedResponse;
import partners.Categories_of_work_info.model.Category;
import partners.Categories_of_work_info.repository.CategoriesRepository;

import java.util.*;

@Service
@AllArgsConstructor
@Slf4j
public class CategoriesService {
    private final CategoriesRepository categoriesRepository;

    @Transactional
    public NextSubCategoryResponse getNextSubCategories(String category) {
        category = category == null ? "start" : category;
        List<String> currentCategory = categoriesRepository.findByNameWithSubCategories(category);
        log.info("Нашёл категории: {}", currentCategory);
        return new NextSubCategoryResponse(1, currentCategory);
//        if (currentCategory.isPresent()){
//            Category actualCategory = currentCategory.get();
//            List<Category> subCategories = actualCategory.getSubCategories();
//            for (Category subCategory : subCategories){
//                nextCategories.add(subCategory.getName());
//            }
//            return new NextSubCategoryResponse(1, nextCategories);
//        } else {
//            return new NextSubCategoryResponse(1, null);
//        }
//        return new NextSubCategoryResponse(1, null);
    }

    public SearchCategoriesWithRelatedResponse searchCategoriesWithRelated(String searchText) {
        searchText += "*";
        List<CategoryWithSubCategories> categories = categoriesRepository.findNodeWithRelated(searchText);
        log.info("ЧО ПОЛУЧИЛИ: {}", categories.toString());
        List<String> resultNodes = new ArrayList<>();
        for (CategoryWithSubCategories category : categories) {
            Category mainNode = category.getNode();
            List<Category> relatedNodes = category.getChildren();

            String mainNodeName = mainNode.getName();
            resultNodes.add(mainNodeName);

            for (Category relatedNode : relatedNodes) {
                String relatedNodeName = relatedNode.getName();
                resultNodes.add(mainNodeName + " " + relatedNodeName);
            }
        }
        return new SearchCategoriesWithRelatedResponse(1, resultNodes);
    }
}
