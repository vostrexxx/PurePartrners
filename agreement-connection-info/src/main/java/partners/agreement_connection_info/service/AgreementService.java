package partners.agreement_connection_info.service;

import lombok.AllArgsConstructor;
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
public class AgreementService {
    private final AgreementRepository agreementRepository;
    private final ModelMapper modelMapper = new ModelMapper();
    private final static String kafkaNewChatTopic = "newChat";
    private final KafkaTemplate<String, NewChat> kafkaTemplate;

    public OperationStatusResponse createAgreement(Long userId, AgreementInfo agreementInfo) {
        try {
            Agreement agreementForSave = modelMapper.map(agreementInfo, Agreement.class);
            agreementForSave.setInitiatorId(userId);
//            agreementForSave.setStatus(ConnectionStatus.PENDING);
//            agreementForSave.setCreateDate(LocalDateTime.now());
//            agreementForSave.setUpdateDate(LocalDateTime.now());
            agreementRepository.save(agreementForSave);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            return new OperationStatusResponse(0);
        }
    }

    public AllUserAgreements getUserAgreementsByMode(Long userId, boolean mode){
        List<Agreement> allUserAgreements;
        if (mode)
            allUserAgreements = agreementRepository.findALlByInitiatorId(userId);
        else
            allUserAgreements = agreementRepository.findAllByReceiverId(userId);
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

//        NewChat =

//        kafkaTemplate.send(kafkaNewChatTopic, )

        return new OperationStatusResponse(1);
    }
}
