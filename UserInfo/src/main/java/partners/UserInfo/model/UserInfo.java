package partners.UserInfo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
@Table(name = "user_info")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfo {
    @Id
    private Long id;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    private String patronymic;

    @Column(nullable = false)
    private String email;

    @DateTimeFormat(pattern = "dd-MM-yyyy")
    @Column(nullable = false)
    private LocalDate birthday;

    @Column(name = "is_passport_confirmed", nullable = false)
    private Boolean isPassportConfirmed = false;
}
