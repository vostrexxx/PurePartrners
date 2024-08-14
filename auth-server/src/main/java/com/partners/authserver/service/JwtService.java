package com.partners.authserver.service;

import com.partners.authserver.model.UserAuthInfo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.key}")
    private String SECRET_KEY;

    @Value("${jwt.expirationTime}")
    private long expirationTime;


    public String generateToken(UserAuthInfo userAuthInfo){
        String token = Jwts
                .builder()
                .subject(userAuthInfo.getPhoneNumber())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + this.expirationTime))
                .signWith(getSigningKey())
                .compact();
        return token;
    }

    public SecretKey getSigningKey(){
        byte[] keyBites = Decoders.BASE64URL.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBites);
    }

    public Claims getAllClaims(String token){
        return Jwts
                .parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> function){
        Claims claims = getAllClaims(token);
        return function.apply(claims);
    }

    public String extractPhoneNumber(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails){
        String phoneNumber = extractPhoneNumber(token);
        return phoneNumber.equals(userDetails.getUsername()) && isTokenNotExpired(token);
    }

    private boolean isTokenNotExpired(String token){
        Date tokenDate = extractClaim(token, Claims::getExpiration);
        return tokenDate.after(new Date());
    }
}
