package partners.change_credentials.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tmp_credentials")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChangeCredentials {
    @Id
    private Long id;

    private String code;
}
