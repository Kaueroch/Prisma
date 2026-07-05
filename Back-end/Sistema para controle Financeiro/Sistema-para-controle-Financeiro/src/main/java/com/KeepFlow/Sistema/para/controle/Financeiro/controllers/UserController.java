package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.UserDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.UserResponseDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao.AutenticacaoRegisterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {
    private final AutenticacaoRegisterService autenticacaoRegisterService;
    public UserController(AutenticacaoRegisterService _autenticacaoRegisterService){
        this.autenticacaoRegisterService = _autenticacaoRegisterService;
    }
    @PostMapping("/registrar")
    public ResponseEntity criarUsuario(@RequestBody UserDTO userDTO){
      autenticacaoRegisterService.RegistrarUsuario(userDTO.nome(), userDTO.email(), userDTO.senha());
      UserResponseDTO responseDTO = new UserResponseDTO(userDTO.nome(), "O seu registro foi completo! Muito obrigado");
      return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);

    }
}