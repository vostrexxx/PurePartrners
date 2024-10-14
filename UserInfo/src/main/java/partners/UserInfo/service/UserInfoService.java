package partners.UserInfo.service;

import jakarta.ws.rs.InternalServerErrorException;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.config.Constants;
import partners.UserInfo.dto.*;
import partners.UserInfo.exception.CantSaveImageException;
import partners.UserInfo.exception.CantSaveUserException;
import partners.UserInfo.exception.NoImageException;
import partners.UserInfo.model.UserInfo;
import partners.UserInfo.repository.UserInfoRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserInfoRepository userInfoRepository;

    private final ModelMapper modelMapper = new ModelMapper();

    public OperationStatusResponse saveUserPersonalData(PersonalDataDTO personalData,
                                                         Long userId) throws CantSaveUserException {

        UserInfo userInfo = modelMapper.map(personalData, UserInfo.class);

        userInfo.setId(userId);
        try {
            userInfoRepository.save(userInfo);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            throw new CantSaveUserException(Constants.KEY_EXCEPTION_CANT_SAVE_USER_INFO, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public PersonalDataResponse getPersonalData(Long userId) {
        Optional<UserInfo> userInfo = userInfoRepository.findById(userId);
        if (userInfo.isEmpty())
            return new PersonalDataResponse(0, null);
        UserInfo actualUserInfo = userInfo.get();
        PersonalDataDTO personalDataDTO = modelMapper.map(actualUserInfo, PersonalDataDTO.class);
        return new PersonalDataResponse(1, personalDataDTO);
    }

    public GetImageResponse getUserImages(Long userId) throws IOException{
        Path firstImagePath = Path.of(Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGES_EXTENSION);
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());
            byte[] image = StreamUtils.copyToByteArray(resource.getInputStream());
            String encodedImage = Base64.getEncoder().encodeToString(image);
            return new GetImageResponse(1, encodedImage);
        }
        else
            return new GetImageResponse(0, null);
    }

    public OperationStatusResponse saveImage(MultipartFile image, Long userId) throws IOException, CantSaveImageException {
        String imagePath = Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new OperationStatusResponse(1);
        else
            throw new CantSaveImageException(Constants.KEY_EXCEPTION_CANT_SAVE_IMAGE, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
