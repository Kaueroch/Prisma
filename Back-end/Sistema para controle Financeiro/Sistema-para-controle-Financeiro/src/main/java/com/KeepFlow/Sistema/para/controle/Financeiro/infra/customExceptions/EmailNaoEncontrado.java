package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class EmailNaoEncontrado extends RuntimeException {
    public EmailNaoEncontrado(String message) {
        super(message);
    }
}
