package partners.UserInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PersonalDataResponse {
    private int success;
    private PersonalDataDTO profile;
}
