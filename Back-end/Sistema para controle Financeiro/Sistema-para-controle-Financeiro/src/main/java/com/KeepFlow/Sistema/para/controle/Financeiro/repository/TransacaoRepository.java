package com.KeepFlow.Sistema.para.controle.Financeiro.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Transacao;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Integer> {
   
}
