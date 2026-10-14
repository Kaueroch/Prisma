package com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request;

import java.math.BigDecimal;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;

public record TransacaoDTO(BigDecimal valor,String descricao,String data, Integer categoria_id) {

}
