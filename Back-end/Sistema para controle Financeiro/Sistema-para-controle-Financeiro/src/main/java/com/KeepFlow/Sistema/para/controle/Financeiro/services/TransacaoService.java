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
	
 public void salvarTransacao(BigDecimal valor,String descricao, String data, Integer categoriaId, UUID userId){
	 // AUDITORIA: antes aceitava qualquer categoria_id sem checar o dono —
	 // permitia gravar transação na categoria de outro usuário — e nunca
	 // preenchia o dono da transação. Agora as duas coisas são garantidas.
	 Categoria categoriaBanco = categoriaRepository.findById(categoriaId)
			 .orElseThrow(() -> new IdNaoExistente("Categoria não encontrada."));
	 if (categoriaBanco.getUser() == null || !categoriaBanco.getUser().getId().equals(userId)) {
		 throw new AcessoNegado("Você não tem acesso a esta categoria.");
	 }
	 User dono = userRepository.getReferenceById(userId);
	 Transacao transacaoBanco = new Transacao(valor,descricao,data, categoriaBanco, dono);
	 transacaoRepository.save(transacaoBanco);
 }
  public void listarTransacoes() {
	//posso pegar pelo id da categoria e pelo id do usuario. O correto seria pelo ID do usuario pra nao ter erro. Enfim, vou ter que ralar um pouco mais pra essa feature sair.  
  }
}
