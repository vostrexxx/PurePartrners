package partners.UserInfo.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.dto.OperationStatusResponse;
import partners.UserInfo.dto.PersonalDataResponse;
import partners.UserInfo.dto.SavePersonalDataRequest;
import partners.UserInfo.exception.CantSavePersonalDataException;
import partners.UserInfo.exception.UserNotFoundException;
import partners.UserInfo.service.UserInfoService;

import java.io.IOException;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("/profile")
public class UserInfoController {

    private final UserInfoService userInfoService;
    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> savePersonalData(@RequestBody SavePersonalDataRequest personalData,
                                                                     @RequestHeader Long userId)
            throws CantSavePersonalDataException {
        OperationStatusResponse userPersonalData = userInfoService.saveUserPersonalData(personalData, userId);
        return ResponseEntity.ok(userPersonalData);
    }

    @GetMapping("")
    public ResponseEntity<PersonalDataResponse> getPersonalData(@RequestHeader Long userId)
            throws UserNotFoundException {
        PersonalDataResponse personalData = userInfoService.getPersonalData(userId);
        return ResponseEntity.ok(personalData);
    }

    @GetMapping(value = "/image", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> getUserPassport (@RequestHeader Long userId) throws IOException {
        Resource images = userInfoService.getUserImages(userId);
        return ResponseEntity.ok(images);
    }

    @PostMapping(value = "/image")
    public ResponseEntity<OperationStatusResponse> saveImage (@RequestHeader Long userId, @RequestBody MultipartFile image) throws IOException {
        OperationStatusResponse response = userInfoService.saveImage(image, userId);
        return ResponseEntity.ok(response);
    }
}
