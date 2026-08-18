package com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions;

public class CampoNomeVazio extends RuntimeException{
	public CampoNomeVazio(String message){
        super(message);
	}
}

