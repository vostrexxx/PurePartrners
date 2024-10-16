package partners.UserInfo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImagePathRequest {
    @JsonProperty
    private String imagePath;
}
