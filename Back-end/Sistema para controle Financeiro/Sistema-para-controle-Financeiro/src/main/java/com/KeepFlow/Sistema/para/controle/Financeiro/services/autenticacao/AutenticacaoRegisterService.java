package com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.EmailExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.security.Security;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;

public class AutenticacaoRegisterService {
    private Security security;
    private UserRepository userRepository;
    public AutenticacaoRegisterService(Security _security, UserRepository _userRepository){
        this.security = _security;
        this.userRepository = _userRepository;
    }


    public User RegistrarUsuario(String email, String senha,String nome){
        verificacaoExistencia_Email(email);
        String senhaHash = criptografarSenha(senha);
        User usuarioNovo = new User(nome,email,senha,senhaHash);
        return userRepository.save(usuarioNovo);
    }


    public String criptografarSenha(String senha){
        senha = security.passwordEncoder().encode(senha);
     return senha;
    }

    public void verificacaoExistencia_Email(String email){
        if(userRepository.existsByEmail(email)){
          throw new EmailExistente("Email já Cadastrado");
        }
    }
}