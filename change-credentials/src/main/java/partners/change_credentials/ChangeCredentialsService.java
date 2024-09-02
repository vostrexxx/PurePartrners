package partners.change_credentials;

import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ChangeCredentialsService {

    private final ChangeCredentialsRepository changeCredentialsRepository;

    public GeneratePhoneResetCodeResponse generatePhoneNumberResetCode(Long id){
        Random r = new Random();
        String randomNumber = String.format("%04d", r.nextInt(1001));
        ChangeCredentials code = new ChangeCredentials(id, randomNumber);
        ChangeCredentials tmpCode = changeCredentialsRepository.save(code);
        if (tmpCode.getId() == null)
            throw new BadRequestException("Can't generate reset code");
        return new GeneratePhoneResetCodeResponse(1);
    }

    public CompareResetPasswordCodeResponse compareResetPasswordCode(String code, Long id){
        Optional<ChangeCredentials> currentCode = changeCredentialsRepository.findById(id);
        if (currentCode.isEmpty())
            throw new BadRequestException("Code is undefined");
        ChangeCredentials actualCurrentCode = currentCode.get();
        if (actualCurrentCode.getCode().equals(code)){
            return new CompareResetPasswordCodeResponse(1);
        } else
            return new CompareResetPasswordCodeResponse(0);
    }
}
