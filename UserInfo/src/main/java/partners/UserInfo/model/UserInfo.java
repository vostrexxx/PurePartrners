package partners.UserInfo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_info")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfo {
    @Id
    private Long id;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String name;
    private String surname;
    private String patronymic;
    private String email;
    private String birthday;
    @Column(name = "is_passport_confirmed")
    private Boolean isPassportConfirmed;
}
