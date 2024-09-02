package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserData {
    @Nullable
    private String name;
    @Nullable
    private String surname;
    @Nullable
    private String patronymic;
    @Nullable
    private String email;
    @Nullable
    private String phoneNumber;
    @Nullable
    private String birthday;
    @Nullable
    private Boolean isPassportConfirmed;
}
