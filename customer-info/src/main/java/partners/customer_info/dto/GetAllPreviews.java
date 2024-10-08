package partners.customer_info.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GetAllPreviews {
    private int success;
    private List<CustomInfoPreview> previews;
}
