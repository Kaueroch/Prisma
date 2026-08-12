package com.KeepFlow.Sistema.para.controle.Financeiro.services.autenticacao;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TokenServicesTest {

    private TokenServices tokenServices;

    @BeforeEach
    void setUp() {
        tokenServices = new TokenServices();
        // Injetando valores simulados para as variáveis @Value usando ReflectionTestUtils
        ReflectionTestUtils.setField(tokenServices, "Secretkey", "chave_secreta_de_teste_muito_segura_123");
        ReflectionTestUtils.setField(tokenServices, "Jwtexpiration", 7200L); // 2 horas
    }

    @Test
    void deveriaGerarEValidarUmTokenComSucesso() {
        // Arrange
        UUID userUuid = UUID.randomUUID();

        // Act - Gera o token
        String token = tokenServices.generateToken(userUuid);

        // Assert - Verifica se não é nulo ou vazio
        assertNotNull(token, "O token não deveria ser nulo");
        assertFalse(token.isEmpty(), "O token não deveria ser vazio");
        // Act - Valida o token
        String subjectValido = tokenServices.validarToken(token);

        // Assert - Verifica se o UUID extraído do token é o mesmo que usamos para criar
        assertEquals(userUuid.toString(), subjectValido, "O UUID do token validado deveria ser igual ao UUID original");
    }

    @Test
    void naoDeveriaValidarTokenComChaveInvalida() {
        // Arrange
        UUID userUuid = UUID.randomUUID();
        String token = tokenServices.generateToken(userUuid);

        // Mudamos a chave secreta para simular uma tentativa de validação com chave errada
        ReflectionTestUtils.setField(tokenServices, "Secretkey", "outra_chave_errada");

        // Act
        String subject = tokenServices.validarToken(token);

        // Assert
        assertNotEquals(userUuid.toString(), subject, "A validação deveria falhar e não retornar o UUID original ao usar uma chave secreta diferente");
    }
}
