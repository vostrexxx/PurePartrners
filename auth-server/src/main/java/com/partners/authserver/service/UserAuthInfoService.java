package com.partners.authserver.service;

import com.partners.authserver.config.Constants;
import com.partners.authserver.dto.*;
import com.partners.authserver.exception.*;
import com.partners.authserver.config.Role;
import com.partners.authserver.model.PasswordResetCode;
import com.partners.authserver.model.UserAuthInfo;
import com.partners.authserver.repository.ResetCodeRepository;
import com.partners.authserver.repository.UserAuthInfoRepository;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.InternalServerErrorException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserAuthInfoService{

    private final UserAuthInfoRepository userAuthInfoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailService userDetailService;
    private final ModelMapper modelMapper = new ModelMapper();
    private final ResetCodeRepository resetCodeRepository;

    public OperationStatusResponse register(RegistrationInfo registrationInfo){

        if (userAuthInfoRepository.existsByPhoneNumber(registrationInfo.getPhoneNumber()))
            throw new BadRequestException(Constants.KEY_EXCEPTION_PHONE_NUMBER_TAKEN);

        UserAuthInfo userAuthInfo = modelMapper.map(registrationInfo, UserAuthInfo.class);
        userAuthInfo.setPassword(passwordEncoder.encode(userAuthInfo.getPassword()));
        userAuthInfo.setRole(Role.USER);

        try{
            userAuthInfoRepository.save(userAuthInfo);
            return new OperationStatusResponse(1);
        } catch (Exception e){
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_USER);
        }
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
            throw new BadCredentialsException(Constants.KEY_EXCEPTION_BAD_CREDENTIALS);
        }
        UserAuthInfo user = userAuthInfoRepository.findByPhoneNumber(loginInfo.getPhoneNumber())
                .orElseThrow(() -> new UsernameNotFoundException(Constants.KEY_EXCEPTION_USER_NOT_FOUND));
        String jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken);
    }

    public TokenValidationResponse validateToken(String authHeader) throws InvalidTokenException {
        if (authHeader == null || !authHeader.startsWith(Constants.KEY_BEARER_HEADER)) {
            throw new InvalidTokenException(Constants.KEY_EXCEPTION_INVALID_TOKEN, HttpStatus.FORBIDDEN);
        }

        String token = authHeader.substring(7);
        String phoneNumber = null;
        try {
            phoneNumber = jwtService.extractPhoneNumber(token);
        } catch (Exception exception){
            throw new InvalidTokenException(Constants.KEY_EXCEPTION_INVALID_TOKEN, HttpStatus.FORBIDDEN);
        }

        if (phoneNumber != null) {
            UserDetails userDetails = userDetailService.loadUserByUsername(phoneNumber);
            if (jwtService.isTokenValid(token, userDetails)) {
                UserAuthInfo userAuthInfo = userAuthInfoRepository.findByPhoneNumber(phoneNumber).
                        orElseThrow(() -> new UsernameNotFoundException(Constants.KEY_EXCEPTION_USER_NOT_FOUND));
                return new TokenValidationResponse(HttpStatus.OK, userAuthInfo.getId());
            }
            else
                throw new InvalidTokenException(Constants.KEY_EXCEPTION_INVALID_TOKEN, HttpStatus.FORBIDDEN);
        } else
            throw new InvalidTokenException(Constants.KEY_EXCEPTION_INVALID_TOKEN, HttpStatus.FORBIDDEN);
    }

    public OperationStatusResponse checkPhoneNumberPresence(String phoneNumber){
        Boolean isTelephonePresent = userAuthInfoRepository.existsByPhoneNumber(phoneNumber);
        int response = isTelephonePresent ? 1 : 0;
        return new OperationStatusResponse(response);
    }

    public IdFromTelephoneResponse getIdByPhoneNumber(String phoneNumber){
        UserAuthInfo userAuthInfo = userAuthInfoRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException(Constants.KEY_EXCEPTION_USER_NOT_FOUND));
        return new IdFromTelephoneResponse(HttpStatus.OK, userAuthInfo.getId());
    }

    public OperationStatusResponse generatePasswordResetCode(String phoneNumber){
        UserAuthInfo userAuthInfo = userAuthInfoRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException(Constants.KEY_EXCEPTION_USER_NOT_FOUND));
        PasswordResetCode resetCode = resetCodeRepository.findByUserAuthInfo(userAuthInfo)
                .orElse(new PasswordResetCode());
        String code = String.valueOf((int) (Math.random() * 9000) + 1000);
        resetCode.setCode(code);
        resetCode.setExpiresAt(LocalDateTime.now().plusMinutes(3));
        resetCode.setUserAuthInfo(userAuthInfo);
        resetCode.setIsVerified(false);

        resetCodeRepository.save(resetCode);
        return new OperationStatusResponse(1);
    }

    public OperationStatusResponse verifyResetCode(String code, String phoneNumber) throws ResetPasswordForbiddenException {
        UserAuthInfo userAuthInfo = userAuthInfoRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException(Constants.KEY_EXCEPTION_USER_NOT_FOUND));
        PasswordResetCode passwordResetCode = resetCodeRepository.findByUserAuthInfo(userAuthInfo)
                .orElseThrow(() -> new UsernameNotFoundException(Constants.KEY_EXCEPTION_PASSWORD_RESET_CODE_NOT_FOUND));

        if (!code.equals(passwordResetCode.getCode()))
            throw new ResetPasswordForbiddenException(Constants.KEY_EXCEPTION_PASSWORD_RESET_CODE_INVALID, HttpStatus.FORBIDDEN);

        if (passwordResetCode.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new ResetPasswordForbiddenException(Constants.KEY_EXCEPTION_PASSWORD_RESET_CODE_EXPIRED, HttpStatus.FORBIDDEN);

        passwordResetCode.setIsVerified(true);
        resetCodeRepository.save(passwordResetCode);
        return new OperationStatusResponse(1);
    }

    public OperationStatusResponse resetPassword(String phoneNumber, String newPassword) throws ResetPasswordForbiddenException {
        UserAuthInfo userAuthInfo = userAuthInfoRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException(Constants.KEY_EXCEPTION_USER_NOT_FOUND));
        PasswordResetCode passwordResetCode = resetCodeRepository.findByUserAuthInfoAndIsVerified(userAuthInfo, true)
                .orElseThrow(() -> new ResetPasswordForbiddenException(Constants.KEY_EXCEPTION_PASSWORD_RESET_FAILED, HttpStatus.FORBIDDEN));
        String encodedPassword = passwordEncoder.encode(newPassword);
        userAuthInfo.setPassword(encodedPassword);
        userAuthInfoRepository.save(userAuthInfo);

        resetCodeRepository.delete(passwordResetCode);
        return new OperationStatusResponse(1);
    }
}
