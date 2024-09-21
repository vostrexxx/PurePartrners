package partners.contractorInfo.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractorInfo {
    private String categoriesOfWork;

    @Nullable
    private String eduDateEnd;

    private Boolean hasTeam;

    @Nullable
    private String team;

    @Nullable
    private Boolean hasEdu;

    @Nullable
    private String eduEst;

    @Nullable
    private String eduDateStart;

    private String workExp;

    private String selfInfo;

    private String prices;
}
