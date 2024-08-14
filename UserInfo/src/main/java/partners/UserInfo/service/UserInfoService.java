package partners.UserInfo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import partners.UserInfo.Constants;
import partners.UserInfo.dto.PersonalDataResponse;
import partners.UserInfo.dto.SavePersonalDataRequest;
import partners.UserInfo.dto.SavePersonalDataResponse;
import partners.UserInfo.exception.CantSavePersonalDataException;
import partners.UserInfo.exception.UserNotFoundException;
import partners.UserInfo.model.UserInfo;
import partners.UserInfo.repository.UserInfoRepository;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserInfoRepository userInfoRepository;

    public SavePersonalDataResponse saveUserPersonalData(SavePersonalDataRequest personalData,
                                                         Long userId) throws CantSavePersonalDataException {
        //TODO make abstract builder
        //TODO check mapstruct, modelmapper
        UserInfo userInfo = UserInfo.builder()
                .id(userId)
                .name(personalData.getName())
                .surname(personalData.getSurname())
                .patronymic(personalData.getPatronymic())
                .email(personalData.getEmail())
                .birthday(personalData.getBirthday())
                .phoneNumber(personalData.getPhoneNumber())
                .isPassportConfirmed(personalData.isPasswordConfirmed())
                .build();
        UserInfo savedPersonalData = userInfoRepository.save(userInfo);
        if (savedPersonalData.getId() == null)
            throw new CantSavePersonalDataException(Constants.cantSavePersonalData, HttpStatus.INTERNAL_SERVER_ERROR);
        return new SavePersonalDataResponse(true);
    }

    public PersonalDataResponse getPersonalData(Long userId) throws UserNotFoundException {
        UserInfo userInfo = userInfoRepository.findById(userId).
                orElseThrow(() -> new UserNotFoundException(Constants.userNotFound, HttpStatus.BAD_REQUEST));
        PersonalDataResponse personalDataResponse = PersonalDataResponse.builder()
                .name(userInfo.getName())
                .surname(userInfo.getSurname())
                .patronymic(userInfo.getPatronymic())
                .phoneNumber(userInfo.getPhoneNumber())
                .email(userInfo.getEmail())
                .isPassportConfirmed(userInfo.getIsPassportConfirmed())
                .build();
        return personalDataResponse;
    }
}
