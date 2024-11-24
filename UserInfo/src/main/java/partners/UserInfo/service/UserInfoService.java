package partners.UserInfo.service;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.FileSystemResource;
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
import partners.UserInfo.model.UserInfo;
import partners.UserInfo.repository.UserInfoRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserInfoService {
    private final UserInfoRepository userInfoRepository;

    private final ModelMapper modelMapper = new ModelMapper();

    public OperationStatusResponse saveUserPersonalData(SavePersonalDataRequest personalData,
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

        //Получение ссылки на авватар
        String avatarPath = Constants.KEY_IMAGES_AVATAR_PATH + userId;
        File avatarDir = new File(avatarPath);
        if (avatarDir.exists() && avatarDir.isDirectory() && avatarDir.listFiles() != null) {
            String resultPath = "avatar/" + userId + "/1" + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
            personalDataDTO.setAvatar(resultPath);
        } else
            personalDataDTO.setAvatar(null);

        //Получение ссылок на изображения паспорта
        String passportPath = Constants.KEY_IMAGES_PASSPORT_PATH + userId;
        File passportDir = new File(passportPath);
        List<String> passportImages = new ArrayList<>();
        if (passportDir.exists() && passportDir.isDirectory() && passportDir.listFiles() != null) {
            for (File file : passportDir.listFiles()) {
                if (file.isFile()) {
                    String imagePath = "passport/" + userId + "/" + file.getName();
                    passportImages.add(imagePath);
                }
            }
        }
        personalDataDTO.setPassport(passportImages.isEmpty() ? null : passportImages);

        return new PersonalDataResponse(1, personalDataDTO);
    }

    public OperationStatusResponse saveAvatar(MultipartFile image, Long userId) throws IOException, CantSaveImageException {
        String imagePath = Constants.KEY_IMAGES_AVATAR_PATH + userId;
        Files.createDirectories(Path.of(imagePath));
        imagePath = imagePath + "/1" + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
        image.transferTo(Path.of(imagePath));
        if (Files.exists(Path.of(imagePath)))
            return new OperationStatusResponse(1);
        else
            throw new CantSaveImageException(Constants.KEY_EXCEPTION_CANT_SAVE_IMAGE, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public OperationStatusResponse savePassportImages(Long userId, MultipartFile image, int page){
        try {
            String imagePath = Constants.KEY_IMAGES_PASSPORT_PATH + userId;
            Files.createDirectories(Path.of(imagePath));
            imagePath += "/" + page + Constants.KEY_DEFAULT_IMAGES_EXTENSION;
            image.transferTo(Path.of(imagePath));
            if (!Files.exists(Path.of(imagePath)))
                return new OperationStatusResponse(0);
            return new OperationStatusResponse(1);
        } catch (Exception e) {
            return new OperationStatusResponse(0);
        }
    }

    public Resource getImageByPath(String imagePath){
        String fullImagePath = Constants.KEY_IMAGES_DEFAULT_PATH + imagePath;
        File file = new File(fullImagePath);
        if (file.exists()){
            return new FileSystemResource(file);
        } else
            return null;
    }

    public OperationStatusResponse deleteAvatar(String imagePath) throws IOException {
        String fullImagePath = Constants.KEY_IMAGES_DEFAULT_PATH + imagePath;
        File file = new File(fullImagePath);
        boolean success = Files.deleteIfExists(file.toPath());
        if (success)
            return new OperationStatusResponse(1);
        else
            return new OperationStatusResponse(0);
    }

    public OtherProfilePreview getOtherProfilePreview(Long userId){
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(NotFoundException::new);
        return modelMapper.map(userInfo, OtherProfilePreview.class);
    }
}
