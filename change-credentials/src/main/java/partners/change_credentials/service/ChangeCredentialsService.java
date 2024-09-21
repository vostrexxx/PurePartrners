package partners.change_credentials.service;

import jakarta.ws.rs.InternalServerErrorException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import partners.change_credentials.config.Constants;
import partners.change_credentials.dto.OperationStatusResponse;
import partners.change_credentials.model.ChangeCredentials;
import partners.change_credentials.repository.ChangeCredentialsRepository;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ChangeCredentialsService {

    private final ChangeCredentialsRepository changeCredentialsRepository;

    public OperationStatusResponse generatePhoneNumberResetCode(Long id){
        Random r = new Random();
        String randomNumber = String.format(Constants.KEY_KODE_FORMAT, r.nextInt(1001));
        ChangeCredentials code = new ChangeCredentials(id, randomNumber);
        ChangeCredentials tmpCode = changeCredentialsRepository.save(code);
        if (tmpCode.getId() == null)
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_GENERATE_RESET_TOKEN);
        return new OperationStatusResponse(1);
    }

    public OperationStatusResponse compareResetPasswordCode(String code, Long id){
        Optional<ChangeCredentials> currentCode = changeCredentialsRepository.findById(id);
        if (currentCode.isEmpty())
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_NO_RESET_TOKEN);
        ChangeCredentials actualCurrentCode = currentCode.get();
        if (actualCurrentCode.getCode().equals(code)){
            return new OperationStatusResponse(1);
        } else
            return new OperationStatusResponse(0);
    }
}
