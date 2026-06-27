package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class SenhaInsuficiente extends RuntimeException {
    public SenhaInsuficiente(String message) {
        super(message);
    }
}
