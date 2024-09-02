package partners.UserInfo.dto;

import jakarta.annotation.Nullable;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import partners.UserInfo.model.UserInfo;

@Getter
@Setter
@Data
public class PersonalDataResponse {
    private int success;
    @Nullable
    private UserData profile;

    public PersonalDataResponse(int success, UserInfo userData) {
        this.success = success;
        if (userData != null)
            profile = new UserData(userData.getName(), userData.getSurname(),
                    userData.getPatronymic(), userData.getEmail(),
                    userData.getPhoneNumber(), userData.getBirthday(), userData.getIsPassportConfirmed());
        else
            profile = null;
    }
}
