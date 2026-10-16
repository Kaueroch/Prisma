package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class AcessoNegado extends RuntimeException {
    public AcessoNegado(String message) {
        super(message);
    }
}
