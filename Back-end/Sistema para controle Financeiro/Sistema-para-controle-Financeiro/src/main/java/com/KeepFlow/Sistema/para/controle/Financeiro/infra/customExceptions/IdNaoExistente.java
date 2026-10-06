package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class IdNaoExistente extends RuntimeException{
   public IdNaoExistente(String message) {
	   super(message);
   }
}
