package com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request;

import java.util.UUID;

public record CategoriaDTO(Integer id,String nome, String tipoCategoria,UUID userId){
}
