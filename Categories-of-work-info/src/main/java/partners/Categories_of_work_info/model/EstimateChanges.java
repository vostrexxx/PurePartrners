package partners.Categories_of_work_info.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table
public class EstimateChanges {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer type;
    private String operation;
    private String elementId;
    private String nodeId;
    private String parentId;
    private Long agreementId;
    private Long initiatorId;

    @Column(columnDefinition = "TEXT")
    private String updatedFields;

    @Column(columnDefinition = "TEXT")
    private String subSubCategories;
}
