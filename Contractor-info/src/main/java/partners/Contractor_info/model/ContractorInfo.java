package partners.Contractor_info.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "contractor_info")
public class ContractorInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Float rating;

    private Boolean hasEdu;

    private String eduEst;

    private LocalDate eduDateStart;

    private LocalDate eduDateEnd;

    private Integer workExp;

}
