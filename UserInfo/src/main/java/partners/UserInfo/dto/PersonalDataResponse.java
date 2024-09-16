package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import partners.UserInfo.model.UserInfo;

@Data
@AllArgsConstructor
public class PersonalDataResponse {
    private int success;
    private PersonalDataDTO profile;
}
