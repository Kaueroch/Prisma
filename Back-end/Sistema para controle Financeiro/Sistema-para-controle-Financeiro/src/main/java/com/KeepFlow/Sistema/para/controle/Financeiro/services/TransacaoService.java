package com.KeepFlow.Sistema.para.controle.Financeiro.services;

import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;
import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Transacao;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.CategoriaDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.TransacaoDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.TransacaoRepository;

@Service
public class TransacaoService {

 private final CategoriaRepository categoriaRepository;
 private final TransacaoRepository transacaoRepository;
	
public TransacaoService(TransacaoRepository _transacaoRepository, CategoriaRepository _categoriaRepository) {
	this.transacaoRepository = _transacaoRepository;
	this.categoriaRepository = _categoriaRepository;
    }
	
 public void salvarTransacao(BigDecimal valor,String descricao, String data, Integer id){
	 Categoria categoriaBanco = categoriaRepository.getReferenceById(id);
	 Transacao transacaoBanco = new Transacao(valor,descricao,data, categoriaBanco);
	 transacaoRepository.save(transacaoBanco);
 }

}