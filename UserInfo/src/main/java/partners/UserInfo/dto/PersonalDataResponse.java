package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonalDataResponse {
    private String name;
    private String surname;
    @Nullable
    private String patronymic;
    private String email;
    private String phoneNumber;
    private boolean isPassportConfirmed;
}
