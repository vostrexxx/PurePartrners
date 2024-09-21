package partners.contractorInfo.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contractor")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Contractor {
    @Id
    private Long id;

//    @Column(name = "categories_of_work")
    private String categoriesOfWork;

//    @Column(name = "has_team")
    private Boolean hasTeam;

    private String team;

//    @Column(name = "has_edu")
    private Boolean hasEdu;

//    @Column(name = "edu_est")
    @Nullable
    private String eduEst;

//    @Column(name = "edu_date_start")
    @Nullable
    private String eduDateStart;

//    @Column(name = "edu_date_end")
    @Nullable
    private String eduDateEnd;

//    @Column(name = "work_exp")
    private String workExp;

//    @Column(name = "self_info")
    private String selfInfo;

    private String prices;
}
