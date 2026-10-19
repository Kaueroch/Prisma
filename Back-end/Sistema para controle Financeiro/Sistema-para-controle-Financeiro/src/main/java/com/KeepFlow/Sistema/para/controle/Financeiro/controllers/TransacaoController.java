package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.TransacaoDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.TransacaoService;

@RestController
@RequestMapping("/api/v1/transacao")
public class TransacaoController {
	
	private TransacaoService transacaoService;
	public TransacaoController(TransacaoService _transacaoService) {
		this.transacaoService = _transacaoService;
	}
	@PostMapping("/criar")
	public ResponseEntity<String> criarTransacao(@RequestBody TransacaoDTO dto){
		// user_id vem no JSON e é conferido contra o token dentro do service.
		UUID userId = ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
		transacaoService.salvarTransacao(dto.valor(),dto.descricao(),dto.data(),dto.categoria_id(), dto.user_id(), userId, dto.observacao());
		return ResponseEntity.ok("Transacao Criada.");
	}
   
}
