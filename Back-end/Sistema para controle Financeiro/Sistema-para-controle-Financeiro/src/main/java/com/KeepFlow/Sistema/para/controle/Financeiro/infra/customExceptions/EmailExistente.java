package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class EmailExistente extends RuntimeException {
    public EmailExistente(String message) {
        super(message);
    }
}
