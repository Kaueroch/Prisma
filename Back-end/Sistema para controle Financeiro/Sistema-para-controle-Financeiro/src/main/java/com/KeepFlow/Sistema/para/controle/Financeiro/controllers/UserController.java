package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.UserDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.UserResponseDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao.AutenticacaoLoginService;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao.AutenticacaoRegisterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {
    private final AutenticacaoRegisterService autenticacaoRegisterService;
    private final AutenticacaoLoginService autenticacaoLoginService;
    public UserController(AutenticacaoRegisterService _autenticacaoRegisterService, AutenticacaoLoginService _autenticacaoLoginService){
        this.autenticacaoRegisterService = _autenticacaoRegisterService;
        this.autenticacaoLoginService = _autenticacaoLoginService;
    }
    @PostMapping("/registrar")
    public ResponseEntity criarUsuario(@RequestBody UserDTO userDTO){
      autenticacaoRegisterService.RegistrarUsuario(userDTO.nome(), userDTO.email(), userDTO.senha());
      UserResponseDTO responseDTO = new UserResponseDTO(userDTO.nome() + ", o seu registro foi completo! Aproveite o sistema!");
      return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }
    @PostMapping("/login")
    public ResponseEntity logarUsuario(@RequestBody UserDTO userDTO){
        String token = autenticacaoLoginService.logarUsuario(userDTO);
        return ResponseEntity.status(HttpStatus.OK).body(new com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.TokenResponseDTO(token));
    }
}