package partners.customer_info.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_info")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Customer {
    @Id
    private Long id;
    private String totalCost;
    private String workCategories;
    private String metro;
    private String house;
    private Boolean hasOther;
    @Nullable
    private String other;
    private String objectName;
    private String startDate;
    private String finishDate;
    private String comments;
}
