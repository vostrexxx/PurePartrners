package partners.UserInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetAvatarResponse {
    private int success;
    private String image;
}
