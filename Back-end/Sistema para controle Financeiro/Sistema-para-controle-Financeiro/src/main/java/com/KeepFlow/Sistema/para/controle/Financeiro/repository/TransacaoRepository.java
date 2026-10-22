package com.KeepFlow.Sistema.para.controle.Financeiro.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Transacao;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Integer> {

	/**
	 * Transações do usuário autenticado, da mais recente para a mais antiga.
	 *
	 * A ordenação é pelo `cd_id` (ordem de inserção) e não pela data: a
	 * coluna `dt_data_gasto` é texto no formato "dd/MM/yyyy", então ordenar
	 * por ela seria alfabético. O front reordena por data quando precisa.
	 *
	 * O nome da propriedade no Spring Data é o do campo (`id`), não o da
	 * coluna (`cd_id`).
	 */
	List<Transacao> findAllByUser_IdOrderByIdDesc(UUID userId);
}
