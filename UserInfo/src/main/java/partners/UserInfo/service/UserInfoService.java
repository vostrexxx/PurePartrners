package partners.UserInfo.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.io.IOUtils;
import org.apache.coyote.BadRequestException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.Constants;
import partners.UserInfo.dto.PersonalDataResponse;
import partners.UserInfo.dto.SaveImageResponse;
import partners.UserInfo.dto.SavePersonalDataRequest;
import partners.UserInfo.dto.SavePersonalDataResponse;
import partners.UserInfo.exception.CantSavePersonalDataException;
import partners.UserInfo.exception.UserNotFoundException;
import partners.UserInfo.model.UserInfo;
import partners.UserInfo.repository.UserInfoRepository;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Optional;

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
        Optional<UserInfo> userInfo = userInfoRepository.findById(userId);
        if (userInfo.isEmpty())
            return new PersonalDataResponse(0, null);
//                orElseThrow(() -> new UserNotFoundException(Constants.userNotFound, HttpStatus.BAD_REQUEST));
        UserInfo actualUserInfo = userInfo.get();
        return new PersonalDataResponse(1, actualUserInfo);
    }

    public Resource getUserImages(Long userId) throws IOException {
        Path firstImagePath = Path.of("src/main/resources/images/" + userId + ".jpg");
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());

//        InputStream firstImage = getClass().getClassLoader().getResourceAsStream("src/main/resources/images/4.jpg");
//        InputStream secondImage = getClass().getResourceAsStream("2.jpg");
//        byte[][] images = new byte[2][];
//        images[0] = IOUtils.toByteArray(firstImage);
//        images[1] = IOUtils.toByteArray(secondImage);
            return resource;
        }
        else
            throw new BadRequestException("No image found");
    }

    public SaveImageResponse saveImage(MultipartFile image, Long userId) throws IOException {
        String imagePath = "src/main/resources/images/" + userId + ".jpg";
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new SaveImageResponse(1);
        return new SaveImageResponse(0);
    }

}
