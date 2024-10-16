package partners.UserInfo.controller;


import jakarta.servlet.ServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.dto.*;
import partners.UserInfo.exception.CantSaveImageException;
import partners.UserInfo.exception.CantSaveUserException;
import partners.UserInfo.service.UserInfoService;

import java.io.IOException;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("/profile")
public class UserInfoController {

    private final UserInfoService userInfoService;
    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> savePersonalData(@RequestBody PersonalDataDTO personalData,
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


//    @GetMapping(value = "/avatar")
//    public ResponseEntity<GetAvatarResponse> getAvatar (@RequestHeader Long userId) throws IOException{
//        GetAvatarResponse images = userInfoService.getAvatar(userId);
//        return ResponseEntity.ok(images);
//    }

    @PostMapping(value = "/avatar")
    public ResponseEntity<OperationStatusResponse> saveAvatar (@RequestHeader Long userId, @RequestBody MultipartFile image) throws IOException, CantSaveImageException {
        OperationStatusResponse response = userInfoService.saveAvatar(image, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/passport")
    public ResponseEntity<OperationStatusResponse> savePassportImages(@RequestHeader Long userId, @RequestBody MultipartFile[] images){
        OperationStatusResponse response = userInfoService.savePassportImages(userId, images);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/passport")
    public ResponseEntity<GetPassportResponse> getPassportImages(@RequestHeader Long userId){
        GetPassportResponse response = userInfoService.getPassportImages(userId);
        return ResponseEntity.ok(response);
    }
}
