package com.partners.authserver.service;

import com.partners.authserver.Constants;
import com.partners.authserver.dto.*;
import com.partners.authserver.exception.CantSaveUserException;
import com.partners.authserver.exception.PhoneNumberTakenException;
import com.partners.authserver.exception.InvalidTokenException;
import com.partners.authserver.exception.TelephoneNotFoundException;
import com.partners.authserver.model.Role;
import com.partners.authserver.model.UserAuthInfo;
import com.partners.authserver.repository.UserAuthInfoRepository;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserAuthInfoService{

    private final UserAuthInfoRepository userAuthInfoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailService userDetailService;

    public OperationStatusResponse register(RegistrationInfo registrationInfo) throws
            PhoneNumberTakenException,
            CantSaveUserException {
        UserAuthInfo userAuthInfo = UserAuthInfo.builder()
                .phoneNumber(registrationInfo.getPhoneNumber())
                .role(Role.USER)
                .password(passwordEncoder.encode(registrationInfo.getPassword()))
                .build();
        if (userAuthInfoRepository.existsByPhoneNumber(userAuthInfo.getPhoneNumber()))
            throw new PhoneNumberTakenException(Constants.phoneNumberAlreadyTaken, HttpStatus.BAD_REQUEST);
        UserAuthInfo savedUser = userAuthInfoRepository.save(userAuthInfo);
        if (savedUser.getId() == null)
            throw new CantSaveUserException(Constants.userSaveError, HttpStatus.INTERNAL_SERVER_ERROR);

//        String jwtToken = jwtService.generateToken(savedUser);
        return new OperationStatusResponse(true);
    }

    public AuthenticationResponse login(LoginInfo loginInfo){
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginInfo.getPhoneNumber(),
                            loginInfo.getPassword()
                    )
            );
        } catch (BadCredentialsException badCredentialsException){
            throw new BadCredentialsException(Constants.badCredentials);
        }
        UserAuthInfo user = userAuthInfoRepository.findByPhoneNumber(loginInfo.getPhoneNumber())
                .orElseThrow(() -> new UsernameNotFoundException(Constants.userNotFound));
        String jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken);
    }

    public TokenValidationResponse validateToken(String authHeader) throws InvalidTokenException {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidTokenException("Invalid token", HttpStatus.FORBIDDEN);
        }

        String token = authHeader.substring(7);
        String phoneNumber = null;
        try {
            phoneNumber = jwtService.extractPhoneNumber(token);
        } catch (Exception exception){
            throw new InvalidTokenException("Invalid token", HttpStatus.FORBIDDEN);
        }

        if (phoneNumber != null) {
            UserDetails userDetails = userDetailService.loadUserByUsername(phoneNumber);
            if (jwtService.isTokenValid(token, userDetails)) {
                UserAuthInfo userAuthInfo = userAuthInfoRepository.findByPhoneNumber(phoneNumber).
                        orElseThrow(() -> new UsernameNotFoundException(Constants.userNotFound));
                return new TokenValidationResponse(HttpStatus.OK, userAuthInfo.getId());
            }
            else
                throw new InvalidTokenException("Invalid token", HttpStatus.FORBIDDEN);
        } else
            throw new InvalidTokenException("No phoneNumber in token", HttpStatus.FORBIDDEN);
    }

    public OperationStatusResponse checkPhoneNumberPresence(String phoneNumber){
        Boolean isTelephonePresent = userAuthInfoRepository.existsByPhoneNumber(phoneNumber);
        int response = isTelephonePresent ? 1 : 0;
        return new OperationStatusResponse(response);
    }

    public IdFromTelephoneResponse getIdByPhoneNumber(String phoneNumber) throws TelephoneNotFoundException {
        Optional<UserAuthInfo> userAuthInfo = userAuthInfoRepository.findByPhoneNumber(phoneNumber);
        if (userAuthInfo.isEmpty())
            throw new TelephoneNotFoundException("PhoneNumber not found", HttpStatus.BAD_REQUEST);
        return new IdFromTelephoneResponse(HttpStatus.OK, userAuthInfo.get().getId());
    }

    @Transactional
    public OperationStatusResponse resetPassword(ResetPasswordRequest newPassword){
        String phoneNumber = newPassword.getPhoneNumber();
        String password = newPassword.getNewPassword();
        String encodedPassword = passwordEncoder.encode(password);
        int affectedRows = userAuthInfoRepository.setPasswordByPhoneNumber(encodedPassword, phoneNumber);
        if (affectedRows < 1)
            throw new BadRequestException("Can't reset password");
        return new OperationStatusResponse(1);
    }
}
