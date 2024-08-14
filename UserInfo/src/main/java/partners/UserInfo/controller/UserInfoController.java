package partners.UserInfo.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import partners.UserInfo.dto.PersonalDataResponse;
import partners.UserInfo.dto.SavePersonalDataRequest;
import partners.UserInfo.dto.SavePersonalDataResponse;
import partners.UserInfo.exception.CantSavePersonalDataException;
import partners.UserInfo.exception.UserNotFoundException;
import partners.UserInfo.service.UserInfoService;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("/profile")
public class UserInfoController {

    private final UserInfoService userInfoService;
    @PostMapping("/save")
    public ResponseEntity<SavePersonalDataResponse> savePersonalData(@RequestBody SavePersonalDataRequest personalData,
                                                                     @RequestHeader Long userId)
            throws CantSavePersonalDataException {
        SavePersonalDataResponse userPersonalData = userInfoService.saveUserPersonalData(personalData, userId);
        return ResponseEntity.ok(userPersonalData);
    }

    @GetMapping("/getData")
    public ResponseEntity<PersonalDataResponse> getPersonalData(@RequestHeader Long userId)
            throws UserNotFoundException {
        PersonalDataResponse personalData = userInfoService.getPersonalData(userId);
        return ResponseEntity.ok(personalData);
    }
}
