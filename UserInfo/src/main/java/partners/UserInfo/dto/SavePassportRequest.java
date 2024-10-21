package partners.UserInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
public class SavePassportRequest {
    private int page;
    private MultipartFile image;
}
