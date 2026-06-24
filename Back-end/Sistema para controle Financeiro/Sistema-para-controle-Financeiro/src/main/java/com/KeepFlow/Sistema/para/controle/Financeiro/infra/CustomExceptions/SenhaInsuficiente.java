package com.KeepFlow.Sistema.para.controle.Financeiro.infra.CustomExceptions;

public class SenhaInsuficiente extends RuntimeException {
    public SenhaInsuficiente(String message) {
        super(message);
    }
}
