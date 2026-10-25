package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EmailExistente.class)
    public ResponseEntity<String> handleEmailExistente(EmailExistente ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler({EmailNaoEncontrado.class, SenhaIncorreta.class})
    public ResponseEntity<String> handleCredenciaisInvalidas(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha inválidos.");
    }

    @ExceptionHandler(SenhaInsuficiente.class)
    public ResponseEntity<String> handleSenhaInsuficiente(SenhaInsuficiente ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
     @ExceptionHandler(CampoVazio.class)
     public ResponseEntity<String> handleCampoNomeVazio(CampoVazio ex)
     {
	     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
     }

    @ExceptionHandler(EmailInvalido.class)
    public ResponseEntity<String> handleEmailInvalido(EmailInvalido ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(CategoriaJaExistente.class)
    public ResponseEntity<String> handleCategoriaJaExistente(CategoriaJaExistente ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(TipoTextoNaoAutorizado.class)
    public ResponseEntity<String> handleTipoTextoNaoAutorizado(TipoTextoNaoAutorizado ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(ValorNegativo.class)
    public ResponseEntity<String> handleValorNegativo(ValorNegativo ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(IdNaoExistente.class)
    public ResponseEntity<String> handleIdNaoExistente(IdNaoExistente ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(AcessoNegado.class)
    public ResponseEntity<String> handleAcessoNegado(AcessoNegado ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @ExceptionHandler(TokenInvalido.class)
    public ResponseEntity<String> handleTokenInvalido(TokenInvalido ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    @ExceptionHandler({IllegalArgumentException.class, java.time.format.DateTimeParseException.class})
    public ResponseEntity<String> handleRequisicaoMalformada(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Requisição inválida.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        log.error("Erro interno não tratado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno. Tente novamente mais tarde.");
    }
}
