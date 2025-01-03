package partners.documents_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Project {
    private String workCategories;
    private String address;
    private LocalDate startDate;
    private LocalDate endDate;
}
