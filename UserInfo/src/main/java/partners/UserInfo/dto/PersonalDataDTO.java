package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.*;

import java.time.LocalDate;
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
    private LocalDate birthday;
    private String avatar;
    private List<String> passport;
}
