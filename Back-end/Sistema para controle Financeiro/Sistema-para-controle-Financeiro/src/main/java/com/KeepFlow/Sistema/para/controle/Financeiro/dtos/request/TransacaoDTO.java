package com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request;

import java.math.BigDecimal;
import java.util.UUID;


public record TransacaoDTO(BigDecimal valor,String descricao,String data, Integer categoria_id,UUID user_id) {

}
