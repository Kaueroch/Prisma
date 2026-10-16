package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class TokenInvalido extends RuntimeException {
    public TokenInvalido(String message) {
        super(message);
    }
}
