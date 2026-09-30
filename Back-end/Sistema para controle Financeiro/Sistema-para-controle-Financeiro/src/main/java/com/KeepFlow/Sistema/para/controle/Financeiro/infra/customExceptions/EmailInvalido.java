package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class EmailInvalido extends RuntimeException {
  public EmailInvalido(String message) {
	super(message);
   }
}
