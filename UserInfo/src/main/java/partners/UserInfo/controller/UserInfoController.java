package partners.UserInfo.controller;


import jakarta.servlet.ServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.dto.*;
import partners.UserInfo.exception.CantSaveImageException;
import partners.UserInfo.exception.CantSaveUserException;
import partners.UserInfo.service.UserInfoService;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/profile")
public class UserInfoController {

    private final UserInfoService userInfoService;
    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> savePersonalData(@RequestBody SavePersonalDataRequest personalData,
                                                                     @RequestHeader Long userId) throws CantSaveUserException {
        OperationStatusResponse userPersonalData = userInfoService.saveUserPersonalData(personalData, userId);
        return ResponseEntity.ok(userPersonalData);
    }

    @GetMapping("")
    public ResponseEntity<PersonalDataResponse> getPersonalData(@RequestHeader Long userId) {
        PersonalDataResponse personalData = userInfoService.getPersonalData(userId);
        return ResponseEntity.ok(personalData);
    }

    @GetMapping(value = "/image")
    public ResponseEntity<Resource> getImageByPath(@RequestParam String imagePath){
        Resource response = userInfoService.getImageByPath(imagePath);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/avatar")
    public ResponseEntity<OperationStatusResponse> saveAvatar (@RequestHeader Long userId, @RequestParam MultipartFile image) throws IOException, CantSaveImageException {
        if (image == null)
            log.info("нет изображения");
        OperationStatusResponse response = userInfoService.saveAvatar(image, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/image")
    public ResponseEntity<OperationStatusResponse> deleteAvatar(@RequestParam String imagePath) throws IOException {
        OperationStatusResponse response = userInfoService.deleteAvatar(imagePath);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/passport")
    public ResponseEntity<OperationStatusResponse> savePassportImages(@RequestHeader Long userId, @RequestPart(value = "image") MultipartFile image, @RequestParam(value = "page") int page) throws IOException {
        OperationStatusResponse response = userInfoService.savePassportImages(userId, image, page);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/other/preview")
    public ResponseEntity<OtherProfilePreview> getOtherProfilePreview(@RequestParam Long userId) {
        OtherProfilePreview response = userInfoService.getOtherProfilePreview(userId);
        return ResponseEntity.ok(response);
    }
}
