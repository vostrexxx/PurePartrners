package partners.announcement_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetAnnouncementInfoResponse {
    private int success;
    private AnnouncementInfo announcement;
}
