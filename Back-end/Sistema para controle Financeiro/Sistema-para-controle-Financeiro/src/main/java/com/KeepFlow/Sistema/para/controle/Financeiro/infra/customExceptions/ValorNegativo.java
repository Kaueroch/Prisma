package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class ValorNegativo  extends RuntimeException{
   public ValorNegativo(String message) {
	   super(message);
   }
}
