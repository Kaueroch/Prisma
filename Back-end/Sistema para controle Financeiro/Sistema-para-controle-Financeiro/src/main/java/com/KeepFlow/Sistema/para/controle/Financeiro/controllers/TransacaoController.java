package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Transacao;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.TransacaoDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.TransacaoService;

import jakarta.persistence.Entity;

@RestController
@RequestMapping("api/v1/transacao")
public class TransacaoController {
	
	private TransacaoService transacaoService;
	public TransacaoController(TransacaoService _transacaoService) {
		this.transacaoService = _transacaoService;
	}
	@PostMapping("/criar")
	public ResponseEntity<String> criarTransacao(@RequestBody TransacaoDTO dto){
		transacaoService.salvarTransacao(dto.valor(),dto.descricao(),dto.data(),dto.categoria_id());
		return ResponseEntity.ok("Transacao Criada.");
	}
   
}
