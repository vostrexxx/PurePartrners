package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class SavePersonalDataRequest {
    private String name;
    private String surname;
    @Nullable
    private String patronymic;

    private String phoneNumber;
    private String email;
    private LocalDate birthday;
}
