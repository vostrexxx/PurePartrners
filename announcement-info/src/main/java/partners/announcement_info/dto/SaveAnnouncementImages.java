package partners.announcement_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
public class SaveAnnouncementImages {
    private Long announcementId;
    private MultipartFile[] announcementImages;
}
