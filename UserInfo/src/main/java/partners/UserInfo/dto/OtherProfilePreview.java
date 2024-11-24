package partners.UserInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtherProfilePreview {
    private String name;
    private String surname;
    private String patronymic;

    private List<String> images;
}
