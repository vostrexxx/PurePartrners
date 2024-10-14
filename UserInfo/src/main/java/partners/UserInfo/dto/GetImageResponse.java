package partners.UserInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.core.io.Resource;

@Data
@AllArgsConstructor
public class GetImageResponse {
    private int success;
    private String image;
}
