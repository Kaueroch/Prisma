package com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao;


import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.UserDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.EmailNaoEncontrado;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.SenhaIncorreta;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.security.Security;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoLoginService {

    UserRepository userRepository;
   Security security;
    public AutenticacaoLoginService(UserRepository _userRepository, Security _security){
        this.userRepository = _userRepository;
        this.security = _security;
    }
    public void logarUsuario(UserDTO userDTO){
    //vai chamar os metodos de validar se o email existe e se senha hasheada esta correta,
    // e se tudo isso retornar true, aqui ira chamar o metodo para gerar o Token
    }
  private boolean validarEmail(String email){
   if(!userRepository.existsByEmail(email)){
    throw new EmailNaoEncontrado("Email não encontrado, tente novamente.");
   }
   return true;
  }
  private boolean validarSenhaCriptografada(UserDTO userDTO){
      UserDTO userBanco = userRepository.existsByUsuario(userDTO.email());
        String senhaPlana = userDTO.senha();
        String senhaBanco = userBanco.senha();
        if(!security.passwordEncoder().matches(senhaBanco,senhaPlana)){
            throw new SenhaIncorreta("Senha incorreta.");
        }
        return true;
  }
}