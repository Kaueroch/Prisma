package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class SenhaIncorreta extends RuntimeException {
    public SenhaIncorreta(String message) {
        super(message);
    }
}
