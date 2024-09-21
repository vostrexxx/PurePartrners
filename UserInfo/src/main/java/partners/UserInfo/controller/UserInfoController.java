package partners.UserInfo.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.dto.OperationStatusResponse;
import partners.UserInfo.dto.PersonalDataDTO;
import partners.UserInfo.dto.PersonalDataResponse;
import partners.UserInfo.exception.CantSaveImageException;
import partners.UserInfo.exception.CantSaveUserException;
import partners.UserInfo.exception.NoImageException;
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

    @GetMapping(value = "/image", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> getUserPassport (@RequestHeader Long userId) throws IOException, NoImageException {
        Resource images = userInfoService.getUserImages(userId);
        return ResponseEntity.ok(images);
    }

    @PostMapping(value = "/image")
    public ResponseEntity<OperationStatusResponse> saveImage (@RequestHeader Long userId, @RequestBody MultipartFile image) throws IOException, CantSaveImageException {
        OperationStatusResponse response = userInfoService.saveImage(image, userId);
        return ResponseEntity.ok(response);
    }
}
