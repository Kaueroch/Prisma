package com.KeepFlow.Sistema.para.controle.Financeiro.services.transacao;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Transacao;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.TransacaoResponseDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.AcessoNegado;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CampoVazio;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.IdNaoExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.TransacaoRepository;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransacaoService {

	private final CategoriaRepository categoriaRepository;
	private final TransacaoRepository transacaoRepository;
	private final UserRepository userRepository;

	public TransacaoService(TransacaoRepository _transacaoRepository, CategoriaRepository _categoriaRepository,
			UserRepository _userRepository) {
		this.transacaoRepository = _transacaoRepository;
		this.categoriaRepository = _categoriaRepository;
		this.userRepository = _userRepository;
	}

	@Transactional
	public Integer salvarTransacao(BigDecimal valor, String descricao, String data, Integer id, UUID userIdCorpo,
			UUID userIdToken, String observacao) {
		if (userIdCorpo != null && !userIdCorpo.equals(userIdToken)) {
			throw new AcessoNegado("Acesso Negado.");
		}
		if (id == null) {
			throw new CampoVazio("Escolha uma categoria válida.");
		}
		Categoria categoriaBanco = categoriaRepository.findById(id)
				.orElseThrow(() -> new IdNaoExistente("Categoria não encontrada."));
		if (categoriaBanco.getUser() == null || !categoriaBanco.getUser().getId().equals(userIdToken)) {
			throw new AcessoNegado("Você não tem acesso a esta categoria.");
		}
		User usuarioBanco = userRepository.getReferenceById(userIdToken);
		Transacao transacaoBanco = new Transacao(valor, descricao, data, categoriaBanco, usuarioBanco);
		if (observacao != null && !observacao.isBlank())
			transacaoBanco.setObservacao(observacao);
		transacaoRepository.save(transacaoBanco);
		return transacaoBanco.getId();
	}

	@Transactional(readOnly = true)
	public List<TransacaoResponseDTO> listarTransacoes(UUID userId) {
		return transacaoRepository.findAllByUser_IdOrderByIdDesc(userId).stream()
				.map(this::paraResponse)
				.toList();
	}

	@Transactional
	public TransacaoResponseDTO editarTransacao(Integer id, BigDecimal valor, String descricao, String data,
			Integer categoriaId, UUID userId, String observacao) {
		Transacao existente = transacaoRepository.findById(id)
				.orElseThrow(() -> new IdNaoExistente("Transação não encontrada."));
		if (existente.getUser() == null || !existente.getUser().getId().equals(userId)) {
			throw new AcessoNegado("Você não tem acesso a esta transação.");
		}
		if (categoriaId == null) {
			throw new CampoVazio("Escolha uma categoria válida.");
		}
		Categoria categoriaBanco = categoriaRepository.findById(categoriaId)
				.orElseThrow(() -> new IdNaoExistente("Categoria não encontrada."));
		if (categoriaBanco.getUser() == null || !categoriaBanco.getUser().getId().equals(userId)) {
			throw new AcessoNegado("Você não tem acesso a esta categoria.");
		}
		User usuarioBanco = userRepository.getReferenceById(userId);
		Transacao atualizada = new Transacao(valor, descricao, data, categoriaBanco, usuarioBanco);
		atualizada.setId(id);
		if (observacao != null && !observacao.isBlank())
			atualizada.setObservacao(observacao);
		transacaoRepository.save(atualizada);
		return paraResponse(atualizada);
	}

	@Transactional
	public void deletarTransacao(Integer id, UUID userId) {
		Transacao transacao = transacaoRepository.findById(id)
				.orElseThrow(() -> new IdNaoExistente("Transação não encontrada."));
		if (transacao.getUser() == null || !transacao.getUser().getId().equals(userId)) {
			throw new AcessoNegado("Você não tem acesso a esta transação.");
		}
		transacaoRepository.delete(transacao);
	}

	private TransacaoResponseDTO paraResponse(Transacao t) {
		Categoria categoria = t.getCategoria();
		return new TransacaoResponseDTO(
				t.getId(),
				t.getValor(),
				t.getDescricao(),
				t.getData(),
				categoria == null ? null : categoria.getId(),
				categoria == null ? null : categoria.getNome(),
				categoria == null ? null : categoria.getTipoCategoria(),
				t.getObservacao());
	}
}
