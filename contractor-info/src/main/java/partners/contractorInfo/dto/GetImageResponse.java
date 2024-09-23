package partners.contractorInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetImageResponse {
    private int success;
    private byte[] image;
}
