package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SavePersonalDataRequest {
    private String name;
    private String surname;
    @Nullable
    private String patronymic;

    private String phoneNumber;
    private String email;
    private String birthday;
    private boolean isPasswordConfirmed;
}
