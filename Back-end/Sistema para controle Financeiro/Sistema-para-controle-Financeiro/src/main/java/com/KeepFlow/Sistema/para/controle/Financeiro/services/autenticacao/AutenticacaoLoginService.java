package com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao;


import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.UserDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.LoginResponseDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.EmailNaoEncontrado;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.SenhaIncorreta;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.security.Security;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoLoginService {

    private final UserRepository userRepository;
    private final Security security;
    private final TokenServices tokenServices;
    public AutenticacaoLoginService(UserRepository _userRepository, Security _security, TokenServices _tokenServices){
        this.userRepository = _userRepository;
        this.security = _security;
        this.tokenServices = _tokenServices;
    }
    public LoginResponseDTO logarUsuario(UserDTO userDTO){
    //vai chamar os metodos de validar se o email existe e se senha hasheada esta correta,
    // e se tudo isso retornar true, aqui ira chamar o metodo para gerar o Token
        validarEmail(userDTO.email());
        validarSenhaCriptografada(userDTO);
        return gerarRespostaLogin(userDTO.email());
    }
  private boolean validarEmail(String email){
   if(!userRepository.existsByEmail(email)){
    throw new EmailNaoEncontrado("Email não encontrado, tente novamente.");
   }
   return true;
  }
  private boolean validarSenhaCriptografada(UserDTO userDTO){
        UserDTO userBanco = userRepository.findByEmail(userDTO.email());
        String senhaPlana = userDTO.senha();
        String senhaBanco = userBanco.senha();
        if(!security.passwordEncoder().matches(senhaPlana,senhaBanco)){
            throw new SenhaIncorreta("Senha incorreta.");
        }
        return true;
  }
  public String gerarToken(String email){
        UserDTO userBanco = userRepository.findByEmail(email);
        return tokenServices.generateToken(userBanco.uuid());
  }
  private LoginResponseDTO gerarRespostaLogin(String email){
        UserDTO userBanco = userRepository.findByEmail(email);
        String token = tokenServices.generateToken(userBanco.uuid());
        return new LoginResponseDTO(token, userBanco.nome());
  }
}