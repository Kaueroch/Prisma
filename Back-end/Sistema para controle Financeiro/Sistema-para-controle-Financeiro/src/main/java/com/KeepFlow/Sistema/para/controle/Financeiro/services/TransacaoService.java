package com.KeepFlow.Sistema.para.controle.Financeiro.services;

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

  public TransacaoService(TransacaoRepository _transacaoRepository, CategoriaRepository _categoriaRepository, UserRepository _userRepository) {
		this.transacaoRepository = _transacaoRepository;
		this.categoriaRepository = _categoriaRepository;
		this.userRepository = _userRepository;
    }

    /**
     * Grava a transação e devolve o {@code cd_id} gerado pelo banco.
     *
     * O id devolvido é o que o front usa como identificador — antes ele
     * inventava um contador local, que não batia com o banco.
     */
    @Transactional
    public Integer salvarTransacao(BigDecimal valor,String descricao, String data, Integer id, UUID userIdCorpo, UUID userIdToken, String observacao){
   	 // O user_id vem no JSON e É conferido: se divergir do dono do token,
   	 // a requisição cai com 403. O dono gravado é sempre o do token.
   	 if (userIdCorpo != null && !userIdCorpo.equals(userIdToken)) {
   		 throw new AcessoNegado("user_id do corpo diverge do usuário autenticado.");
   	 }
   	 // AUDITORIA: categoria_id nulo (ou não numérico) ia direto para o
   	 // findById e estourava um NPE -> 500 "erro interno" sem explicar
   	 // nada. Agora é um 400 explicável, como os outros campos.
   	 if (id == null) {
   		 throw new CampoVazio("Escolha uma categoria válida.");
   	 }
   	 Categoria categoriaBanco = categoriaRepository.findById(id)
   			 .orElseThrow(() -> new IdNaoExistente("Categoria não encontrada."));
   	 if (categoriaBanco.getUser() == null || !categoriaBanco.getUser().getId().equals(userIdToken)) {
   		 throw new AcessoNegado("Você não tem acesso a esta categoria.");
   	 }
   	 User usuarioBanco = userRepository.getReferenceById(userIdToken);
   	 Transacao transacaoBanco = new Transacao(valor,descricao,data, categoriaBanco, usuarioBanco);
   	 if (observacao != null && !observacao.isBlank()) transacaoBanco.setObservacao(observacao);
   	 transacaoRepository.save(transacaoBanco);
   	 return transacaoBanco.getId();
    }

    /**
     * Lista as transações do dono autenticado.
     *
     * Sem isso o front só tinha a lista local: o dado existia no banco, mas
     * nunca voltava para a tela — recarregar a página apagava tudo.
     */
    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> listarTransacoes(UUID userId) {
   	 return transacaoRepository.findAllByUser_IdOrderByIdDesc(userId).stream()
   			 .map(this::paraResponse)
   			 .toList();
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
