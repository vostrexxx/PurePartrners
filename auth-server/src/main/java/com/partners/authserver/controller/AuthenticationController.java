package com.partners.authserver.controller;

import com.partners.authserver.dto.*;
import com.partners.authserver.exception.CantSaveUserException;
import com.partners.authserver.exception.InvalidTokenException;
import com.partners.authserver.exception.PhoneNumberTakenException;
import com.partners.authserver.exception.TelephoneNotFoundException;
import com.partners.authserver.service.UserAuthInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/auth")
public class AuthenticationController {

    private final UserAuthInfoService userAuthInfoService;

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> userRegistration(@RequestBody RegistrationInfo registrationInfo) throws
            PhoneNumberTakenException,
            CantSaveUserException {
        RegistrationResponse response = userAuthInfoService.register(registrationInfo);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> userLogin(@RequestBody LoginInfo loginInfo){
        AuthenticationResponse response = userAuthInfoService.login(loginInfo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validateToken/{token}")
    public ResponseEntity<TokenValidationResponse> validateToken(@PathVariable("token") String token) throws
            InvalidTokenException {
        TokenValidationResponse response = userAuthInfoService.validateToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/checkPhoneNumber")
    public ResponseEntity<CheckPhoneNumberResponse> checkPhoneNumber(@RequestBody CheckPhoneNumber phoneNumber){
        CheckPhoneNumberResponse response = userAuthInfoService.checkPhoneNumberPresence(phoneNumber.getPhoneNumber());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{phoneNumber}")
    public ResponseEntity<IdFromTelephoneResponse> getIdByTelephone(@PathVariable("phoneNumber") String phoneNumber) throws TelephoneNotFoundException {
        IdFromTelephoneResponse userId = userAuthInfoService.getIdByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@RequestBody ResetPasswordRequest newPassword){
        ResetPasswordResponse resetPasswordResponse = userAuthInfoService.resetPassword(newPassword);
        return ResponseEntity.ok(resetPasswordResponse);
    }
}
