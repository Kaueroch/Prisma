package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;
import java.lang.RuntimeException;

public class TipoTextoNaoAutorizado extends RuntimeException{

 public TipoTextoNaoAutorizado(String message){
    super(message);
 }
}
