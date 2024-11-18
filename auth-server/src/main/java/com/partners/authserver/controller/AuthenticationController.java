package com.partners.authserver.controller;

import com.partners.authserver.dto.*;
import com.partners.authserver.exception.*;
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
    public ResponseEntity<OperationStatusResponse> userRegistration(@RequestBody RegistrationInfo registrationInfo){
        OperationStatusResponse response = userAuthInfoService.register(registrationInfo);
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
    public ResponseEntity<OperationStatusResponse> checkPhoneNumber(@RequestBody CheckPhoneNumber phoneNumber){
        OperationStatusResponse response = userAuthInfoService.checkPhoneNumberPresence(phoneNumber.getPhoneNumber());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{phoneNumber}")
    public ResponseEntity<IdFromTelephoneResponse> getIdByTelephone(@PathVariable("phoneNumber") String phoneNumber){
        IdFromTelephoneResponse userId = userAuthInfoService.getIdByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/password/code")
    public ResponseEntity<OperationStatusResponse> generatePasswordResetCode(@RequestBody CheckPhoneNumber phoneNumber){
        OperationStatusResponse response = userAuthInfoService.generatePasswordResetCode(phoneNumber);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password")
    public ResponseEntity<OperationStatusResponse> resetPassword(@RequestBody ResetPasswordRequest newPassword){
        OperationStatusResponse response = userAuthInfoService.resetPassword(newPassword);
        return ResponseEntity.ok(response);
    }
}
