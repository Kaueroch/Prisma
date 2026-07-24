package com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao;

import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.UserDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.EmailNaoEncontrado;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.SenhaIncorreta;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.security.Security;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutenticacaoLoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Security security;

    @Mock
    private TokenServices tokenServices;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AutenticacaoLoginService autenticacaoLoginService;

    private UserDTO userDTO;
    private UserDTO userBanco;
    private final String email = "test@test.com";
    private final String senhaPlana = "123456";
    private final String senhaCriptografada = "hashedPassword";
    private final UUID userUuid = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        userDTO = new UserDTO(null, "Test User", email, senhaPlana);
        userBanco = new UserDTO(userUuid, "Test User", email, senhaCriptografada);
    }

    @Test
    void logarUsuario_ComSucesso() {
        // Arrange
        when(userRepository.existsByEmail(email)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(userBanco);
        when(security.passwordEncoder()).thenReturn(passwordEncoder);
        when(passwordEncoder.matches(senhaPlana, senhaCriptografada)).thenReturn(true);

        // Act
        autenticacaoLoginService.logarUsuario(userDTO);

        // Assert
        verify(userRepository).existsByEmail(email);
        verify(userRepository, times(2)).findByEmail(email); // Chamado em validarSenhaCriptografada e gerarToken
        verify(security).passwordEncoder();
        verify(passwordEncoder).matches(senhaPlana, senhaCriptografada);
        verify(tokenServices).gerarToken(userUuid);
    }

    @Test
    void logarUsuario_DeveLancarEmailNaoEncontrado() {
        // Arrange
        when(userRepository.existsByEmail(email)).thenReturn(false);

        // Act & Assert
        assertThrows(EmailNaoEncontrado.class, () -> autenticacaoLoginService.logarUsuario(userDTO));
        
        verify(userRepository).existsByEmail(email);
        verify(userRepository, never()).findByEmail(anyString());
        verify(tokenServices, never()).gerarToken(any());

    }

    @Test
    void logarUsuario_DeveLancarSenhaIncorreta() {
        // Arrange
        when(userRepository.existsByEmail(email)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(userBanco);
        when(security.passwordEncoder()).thenReturn(passwordEncoder);
        when(passwordEncoder.matches(senhaPlana, senhaCriptografada)).thenReturn(false);

        // Act & Assert
        assertThrows(SenhaIncorreta.class, () -> autenticacaoLoginService.logarUsuario(userDTO));
        
        verify(userRepository).existsByEmail(email);
        verify(userRepository).findByEmail(email);
        verify(security).passwordEncoder();
        verify(passwordEncoder).matches(senhaPlana, senhaCriptografada);
        verify(tokenServices, never()).gerarToken(any());
    }
}