package partners.Categories_of_work_info.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.Categories_of_work_info.dto.NextSubCategoryResponse;
import partners.Categories_of_work_info.service.CategoriesService;

@RestController
@AllArgsConstructor
@RequestMapping("/categories")
@CrossOrigin
public class CategoriesController {
    private final CategoriesService service;

    @GetMapping("")
    public ResponseEntity<NextSubCategoryResponse> getNextSubCategories(@RequestParam(required = false) String category){
        NextSubCategoryResponse response = service.getNextSubCategories(category);
        return ResponseEntity.ok(response);
    }
}
