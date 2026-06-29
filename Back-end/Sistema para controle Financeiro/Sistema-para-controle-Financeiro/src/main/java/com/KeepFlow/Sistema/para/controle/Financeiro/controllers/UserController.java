package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao.AutenticacaoRegisterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/user")
public class UserController {
    private final AutenticacaoRegisterService autenticacaoRegisterService;
    public UserController(AutenticacaoRegisterService _autenticacaoRegisterService){
        this.autenticacaoRegisterService = _autenticacaoRegisterService;
    }
    @PostMapping("/registrar")
    public ResponseEntity criarUsuario(){

    }
}
