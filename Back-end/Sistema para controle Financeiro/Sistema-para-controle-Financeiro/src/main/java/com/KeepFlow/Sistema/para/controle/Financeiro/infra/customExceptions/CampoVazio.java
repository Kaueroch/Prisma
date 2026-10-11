package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class CampoVazio extends RuntimeException{
	public CampoVazio(String message){
        super(message);
	}
}

