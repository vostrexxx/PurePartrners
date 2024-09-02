package partners.UserInfo.controller;


import lombok.RequiredArgsConstructor;
import org.apache.commons.io.IOUtils;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import partners.UserInfo.dto.PersonalDataResponse;
import partners.UserInfo.dto.SaveImageResponse;
import partners.UserInfo.dto.SavePersonalDataRequest;
import partners.UserInfo.dto.SavePersonalDataResponse;
import partners.UserInfo.exception.CantSavePersonalDataException;
import partners.UserInfo.exception.UserNotFoundException;
import partners.UserInfo.service.UserInfoService;

import java.io.IOException;
import java.io.InputStream;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("/profile")
public class UserInfoController {

    private final UserInfoService userInfoService;
    @PostMapping("")
    public ResponseEntity<SavePersonalDataResponse> savePersonalData(@RequestBody SavePersonalDataRequest personalData,
                                                                     @RequestHeader Long userId)
            throws CantSavePersonalDataException {
        SavePersonalDataResponse userPersonalData = userInfoService.saveUserPersonalData(personalData, userId);
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
    public ResponseEntity<SaveImageResponse> saveImage (@RequestHeader Long userId, @RequestBody MultipartFile image) throws IOException {
        SaveImageResponse response = userInfoService.saveImage(image, userId);
        return ResponseEntity.ok(response);
    }
}
