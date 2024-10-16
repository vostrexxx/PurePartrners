package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonalDataDTO {
    private String name;
    private String surname;
    @Nullable
    private String patronymic;

    private String phoneNumber;
    private String email;
    private String birthday;
    private Boolean isPassportConfirmed;
    private String avatar;
    private List<String> passport;
}
