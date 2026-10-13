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
        // Inject mock values for the @Value variables using ReflectionTestUtils
        ReflectionTestUtils.setField(tokenServices, "Secretkey", "chave_secreta_de_teste_muito_segura_123");
        ReflectionTestUtils.setField(tokenServices, "Jwtexpiration", 7200L); // 2 hours
    }

    @Test
    void deveriaGerarEValidarUmTokenComSucesso() {
        // Arrange
        UUID userUuid = UUID.randomUUID();

        // Act - Generate the token
        String token = tokenServices.generateToken(userUuid);

        // Assert - Check that it is not null or empty
        assertNotNull(token, "The token should not be null");
        assertFalse(token.isEmpty(), "The token should not be empty");
        // Act - Validate the token
        String subjectValido = tokenServices.validarToken(token);

        // Assert - Check that the UUID extracted from the token matches the one used to create it
        assertEquals(userUuid.toString(), subjectValido, "The validated token UUID should match the original UUID");
    }

    @Test
    void naoDeveriaValidarTokenComChaveInvalida() {
        // Arrange
        UUID userUuid = UUID.randomUUID();
        String token = tokenServices.generateToken(userUuid);

        // Change the secret key to simulate a validation attempt with the wrong key
        ReflectionTestUtils.setField(tokenServices, "Secretkey", "outra_chave_errada");

        // Act
        String subject = tokenServices.validarToken(token);

        // Assert
        assertNotEquals(userUuid.toString(), subject, "Validation should fail and not return the original UUID when using a different secret key");
    }
}
