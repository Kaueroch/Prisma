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

	/**
	 * Usuário do token — nunca do corpo da requisição.
	 * O `user_id` do JSON é conferido contra esse valor (403 se divergir).
	 */
	private UUID usuarioAutenticado() {
		return ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
	}

	@PostMapping("/criar")
	public ResponseEntity<TransacaoResponseDTO> criarTransacao(@RequestBody TransacaoDTO dto) {
		Integer id = transacaoService.salvarTransacao(
				dto.valor(), dto.descricao(), dto.data(), dto.categoria_id(),
				dto.user_id(), usuarioAutenticado(), dto.observacao());
		// Devolve o cd_id gerado pelo banco — é o que o front usa como id
		// da transação (antes ele inventava um contador local).
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new TransacaoResponseDTO(id, dto.valor(), dto.descricao(), dto.data(),
						dto.categoria_id(), null, null, dto.observacao()));
	}

	/**
	 * Lista as transações do usuário autenticado.
	 * Sem esse endpoint o front só tinha os dados locais e perdia tudo
	 * ao recarregar a página.
	 */
	@GetMapping("/listar")
	public ResponseEntity<List<TransacaoResponseDTO>> listarTransacoes() {
		return ResponseEntity.ok(transacaoService.listarTransacoes(usuarioAutenticado()));
	}

	@PostMapping("/editar")
	public ResponseEntity<String> editarTransacao(@RequestBody TransacaoDTO dto) {
		transacaoService.editarTransacao(dto.transacao_id(), dto.user_id());

		return ResponseEntity.ok().body("Transacao foi editada.");
	}

	@DeleteMapping("/excluir")
	public ResponseEntity<String> excluirTransacao(@RequestBody TransacaoDTO dto) {
		transacaoService.excluirTransacao(dto.transacao_id());
		return ResponseEntity.ok().body("Transacao foi excluida.");
	}

}
