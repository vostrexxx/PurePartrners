package partners.Categories_of_work_info.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import partners.Categories_of_work_info.dto.NextSubCategoryResponse;
import partners.Categories_of_work_info.model.Category;
import partners.Categories_of_work_info.repository.CategoriesRepository;

import java.util.*;

@Service
@AllArgsConstructor
public class CategoriesService {
    private final CategoriesRepository categoriesRepository;

    @Transactional
    public NextSubCategoryResponse getNextSubCategories(String category) {
        category = category == null ? "start" : category;
        List<String> currentCategory = categoriesRepository.findByNameWithSubCategories(category);
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
}
