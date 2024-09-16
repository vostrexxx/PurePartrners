package partners.change_credentials.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import partners.change_credentials.config.Constants;
import partners.change_credentials.dto.OperationStatusResponse;
import partners.change_credentials.exception.CantGenerateTokenException;
import partners.change_credentials.exception.NoResetCodeException;
import partners.change_credentials.model.ChangeCredentials;
import partners.change_credentials.repository.ChangeCredentialsRepository;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ChangeCredentialsService {

    private final ChangeCredentialsRepository changeCredentialsRepository;

    public OperationStatusResponse generatePhoneNumberResetCode(Long id) throws CantGenerateTokenException {
        Random r = new Random();
        String randomNumber = String.format("%04d", r.nextInt(1001));
        ChangeCredentials code = new ChangeCredentials(id, randomNumber);
        ChangeCredentials tmpCode = changeCredentialsRepository.save(code);
        if (tmpCode.getId() == null)
            throw new CantGenerateTokenException(Constants.KEY_CANT_GENERATE_RESET_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR);
        return new OperationStatusResponse(1);
    }

    public OperationStatusResponse compareResetPasswordCode(String code, Long id) throws NoResetCodeException {
        Optional<ChangeCredentials> currentCode = changeCredentialsRepository.findById(id);
        if (currentCode.isEmpty())
            throw new NoResetCodeException(Constants.KEY_NO_RESET_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR);
        ChangeCredentials actualCurrentCode = currentCode.get();
        if (actualCurrentCode.getCode().equals(code)){
            return new OperationStatusResponse(1);
        } else
            return new OperationStatusResponse(0);
    }
}
