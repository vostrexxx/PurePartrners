package partners.change_credentials;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompareResetPasswordCodeRequest {
    private String code;
    private String phoneNumber;
}
