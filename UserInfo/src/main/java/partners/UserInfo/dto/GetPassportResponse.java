package partners.UserInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GetPassportResponse {
    private int success;
    private List<String> images;
}
