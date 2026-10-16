package com.KeepFlow.Sistema.para.controle.Financeiro.services;

import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Transacao;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.AcessoNegado;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.IdNaoExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.TransacaoRepository;

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

 public void salvarTransacao(BigDecimal valor,String descricao, String data, Integer id, UUID userIdCorpo, UUID userIdToken){
	 // O user_id vem no JSON e É conferido: se divergir do dono do token,
	 // a requisição cai com 403. O dono gravado é sempre o do token.
	 if (userIdCorpo != null && !userIdCorpo.equals(userIdToken)) {
		 throw new AcessoNegado("user_id do corpo diverge do usuário autenticado.");
	 }
	 Categoria categoriaBanco = categoriaRepository.findById(id)
			 .orElseThrow(() -> new IdNaoExistente("Categoria não encontrada."));
	 if (categoriaBanco.getUser() == null || !categoriaBanco.getUser().getId().equals(userIdToken)) {
		 throw new AcessoNegado("Você não tem acesso a esta categoria.");
	 }
	 User usuarioBanco = userRepository.getReferenceById(userIdToken);
	 Transacao transacaoBanco = new Transacao(valor,descricao,data, categoriaBanco, usuarioBanco);
	 transacaoRepository.save(transacaoBanco);
 }
  public void listarTransacoes() {
	//posso pegar pelo id da categoria e pelo id do usuario. O correto seria pelo ID do usuario pra nao ter erro. Enfim, vou ter que ralar um pouco mais pra essa feature sair.
  }
}
