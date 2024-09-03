package partners.contractorInfo;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Entity
@Table(name = "contractor")
@Builder
@Data
@AllArgsConstructor
public class Contractor {
    @Id
    private Long id;

    @Column(name = "categories_of_work")
    private String categoriesOfWork;

    @Column(name = "has_team")
    private Boolean hasTeam;

    @Nullable
    private String team;

    @Column(name = "has_edu")
    @Nullable
    private Boolean hasEdu;

    @Column(name = "edu_est")
    @Nullable
    private String eduEst;

    @Column(name = "edu_date_start")
    @Nullable
    private String eduDateStart;

    @Column(name = "edu_date_end")
    @Nullable
    private String eduDateEnd;

//    @Column(name = "work_exp")
    private String workExp;

    @Column(name = "self_info")
    @Nullable
    private String selfInfo;

    @Nullable
    private String prices;
}
