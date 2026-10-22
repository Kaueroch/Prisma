package com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response;

import java.math.BigDecimal;

/**
 * Transação como o front-end precisa consumir.
 *
 * O `id` é o `cd_id` gerado pelo banco — o front usa esse valor como
 * identificador da transação (e o mesmo para `categoria_id`, que aponta
 * para o `cd_id` de `tb_categorias`).
 *
 * `categoria_nome` e `categoria_tipo` vêm junto para o front não precisar
 * cruzar com a lista de categorias só para descobrir se a transação é
 * receita ou despesa.
 */
public record TransacaoResponseDTO(
        Integer id,
        BigDecimal valor,
        String descricao,
        String data,
        Integer categoria_id,
        String categoria_nome,
        String categoria_tipo,
        String observacao) {
}
