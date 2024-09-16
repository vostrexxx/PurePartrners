package partners.UserInfo.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.io.IOUtils;
import org.apache.coyote.BadRequestException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.config.Constants;
import partners.UserInfo.dto.*;
import partners.UserInfo.exception.CantSavePersonalDataException;
import partners.UserInfo.exception.UserNotFoundException;
import partners.UserInfo.model.UserInfo;
import partners.UserInfo.repository.UserInfoRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserInfoRepository userInfoRepository;

    public OperationStatusResponse saveUserPersonalData(SavePersonalDataRequest personalData,
                                                         Long userId) throws CantSavePersonalDataException {
        //TODO make abstract builder
        //TODO implement modelmapper
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
            throw new CantSavePersonalDataException(Constants.KEY_EXCEPTION_CANT_SAVE_USER_INFO, HttpStatus.INTERNAL_SERVER_ERROR);
        return new OperationStatusResponse(1);
    }

    public PersonalDataResponse getPersonalData(Long userId) {
        Optional<UserInfo> userInfo = userInfoRepository.findById(userId);
        if (userInfo.isEmpty())
            return new PersonalDataResponse(0, null);
        UserInfo actualUserInfo = userInfo.get();
        return new PersonalDataResponse(1, actualUserInfo);
    }

    public Resource getUserImages(Long userId) throws IOException {
        Path firstImagePath = Path.of(Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGES_EXTENSION);
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());
            return resource;
        }
        else
            throw new BadRequestException(Constants.KEY_EXCEPTION_NO_IMAGE);
    }

    public OperationStatusResponse saveImage(MultipartFile image, Long userId) throws IOException {
        String imagePath = Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new OperationStatusResponse(1);
        return new OperationStatusResponse(0);
    }

}
