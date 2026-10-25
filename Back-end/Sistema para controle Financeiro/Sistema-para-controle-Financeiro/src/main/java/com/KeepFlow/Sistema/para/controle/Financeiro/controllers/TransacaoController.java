package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.TransacaoDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.TransacaoResponseDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.transacao.TransacaoService;

@RestController
@RequestMapping("/api/v1/transacao")
public class TransacaoController {

	private TransacaoService transacaoService;

	public TransacaoController(TransacaoService _transacaoService) {
		this.transacaoService = _transacaoService;
	}

	private UUID usuarioAutenticado() {
		return ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
	}

	@PostMapping("/criar")
	public ResponseEntity<TransacaoResponseDTO> criarTransacao(@RequestBody TransacaoDTO dto) {
		Integer id = transacaoService.salvarTransacao(
				dto.valor(), dto.descricao(), dto.data(), dto.categoria_id(),
				dto.user_id(), usuarioAutenticado(), dto.observacao());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new TransacaoResponseDTO(id, dto.valor(), dto.descricao(), dto.data(),
						dto.categoria_id(), null, null, dto.observacao()));
	}

	@GetMapping("/listar")
	public ResponseEntity<List<TransacaoResponseDTO>> listarTransacoes() {
		return ResponseEntity.ok(transacaoService.listarTransacoes(usuarioAutenticado()));
	}

	@PostMapping("/atualizar")
	public ResponseEntity<TransacaoResponseDTO> atualizarTransacao(@RequestBody TransacaoDTO dto) {
		TransacaoResponseDTO updated = transacaoService.editarTransacao(
				dto.id(), dto.valor(), dto.descricao(), dto.data(),
				dto.categoria_id(), usuarioAutenticado(), dto.observacao());
		return ResponseEntity.ok(updated);
	}

	@DeleteMapping("/deletar")
	public ResponseEntity<Void> deletarTransacao(@RequestParam Integer id) {
		transacaoService.deletarTransacao(id, usuarioAutenticado());
		return ResponseEntity.noContent().build();
	}

}
