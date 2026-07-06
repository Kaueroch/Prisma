package com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.EmailExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.security.Security;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoRegisterService {
    private final Security security;
    private final UserRepository userRepository;
  //- Vou instanciar a classe user no Services e la sim,
    // fazer o hash,validacao de email existente, e criar usuario,entendeu?

    public AutenticacaoRegisterService(Security _security, UserRepository _userRepository){
        this.security = _security;
        this.userRepository = _userRepository;
    }
    public User RegistrarUsuario(String _nome, String _email,String _senha){
        emailExiste(_email);
        String senhaHash = criptografarSenha(_senha);
        User usuarioNovo = new User(_nome, _email, _senha, senhaHash);

        return userRepository.save(usuarioNovo);
    }


    public String criptografarSenha(String senha){
        senha = security.passwordEncoder().encode(senha);
     return senha;
    }

    public void emailExiste(String email){
        if(userRepository.existsByEmail(email)){
          throw new EmailExistente("Email já Cadastrado");
        }
    }
}