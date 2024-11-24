package partners.agreement_connection_info.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import partners.agreement_connection_info.config.ConnectionStatus;
import partners.agreement_connection_info.dto.*;
import partners.agreement_connection_info.model.Agreement;
import partners.agreement_connection_info.repository.AgreementRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class AgreementService {
    private final AgreementRepository agreementRepository;
    private final ModelMapper modelMapper;

    public OperationStatusResponse createAgreement(Long userId, AgreementInfo agreementInfo) {
        try {
            Agreement agreementForSave = modelMapper.map(agreementInfo, Agreement.class);
            agreementForSave.setInitiatorId(userId);
            agreementRepository.save(agreementForSave);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            log.error(e.getMessage());
            return new OperationStatusResponse(0);
        }
    }

    public AllUserAgreements getUserAgreementsByMode(Long userId, boolean initiatorMode, int mode){
        List<Agreement> allUserAgreements;
        if (initiatorMode)
            allUserAgreements = agreementRepository.findALlByInitiatorIdAndMode(userId, mode);
        else
            allUserAgreements = agreementRepository.findAllByReceiverIdAndMode(userId, mode);
        List<AgreementInfo> resultList = new ArrayList<>();
        for (Agreement agreement : allUserAgreements) {
            AgreementInfo agreementInfo = modelMapper.map(agreement, AgreementInfo.class);
            resultList.add(agreementInfo);
        }
        return new AllUserAgreements(userId, resultList);
    }

    public OperationStatusResponse updateAgreement(UpdateAgreementInfo updateAgreementInfo) {
        Agreement agreement = agreementRepository.getReferenceById(updateAgreementInfo.getAgreementId());
        agreement.setStatus(updateAgreementInfo.getNewStatus());
//        agreement.setUpdateDate(LocalDateTime.now());
        agreementRepository.save(agreement);
        return new OperationStatusResponse(1);
    }
}
