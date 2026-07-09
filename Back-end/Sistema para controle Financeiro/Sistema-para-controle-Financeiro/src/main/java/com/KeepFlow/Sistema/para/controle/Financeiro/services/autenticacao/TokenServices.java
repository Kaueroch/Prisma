package com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.UserDTO;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;

@Service
public class TokenServices {
   @Value("${api.security.token.secret}")
    private String Secretkey;
   @Value("${api.security.time.expiration.token.secret}")
    private long Jwtexpiration;

    public void gerarToken(UserDTO userDTO){
        try{
        // algoritmo que ira construir o conteudo do meu token
            Algorithm algorithm = Algorithm.HMAC256(Secretkey); //define o algoritmo que vamos usar para gerar o token
            JWT.create()
                    .withIssuer("Prisma")
                    .withSubject(userDTO.uuid().toString())
                    .withExpiresAt(Instant.now().plusSeconds(Jwtexpiration))
                    .sign(algorithm);
        }catch(JWTCreationException exception){
            throw new RuntimeException("Erro ao gerar token JWT");
        }
    }
}

