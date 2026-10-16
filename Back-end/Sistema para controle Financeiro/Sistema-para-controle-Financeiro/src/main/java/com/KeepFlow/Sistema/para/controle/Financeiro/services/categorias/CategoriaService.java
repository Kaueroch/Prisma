package com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.CategoriaDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.AcessoNegado;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CategoriaJaExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.IdNaoExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@Service
public class CategoriaService{
 private final CategoriaRepository categoriaRepository;
 private final UserRepository userRepository;

 public CategoriaService(CategoriaRepository _categoriaRepository,UserRepository _userRepository){
    this.categoriaRepository = _categoriaRepository; 
    this.userRepository = _userRepository;
 }
 
 @Transactional
 public void SalvarCategoria(String nome,String tipoCategoria,UUID userId){
   if(!validaNomeCategoria(nome,userId)) {
	 User usuario = userRepository.getReferenceById(userId); 
	 categoriaRepository.save(new Categoria(nome,tipoCategoria,usuario));
   }    
 }
 private boolean validaNomeCategoria(String nome,UUID userID){
 if(categoriaRepository.existsByNomeAndUser_Id(nome,userID)){
   throw new CategoriaJaExistente("Category already exists."); 
 }
 return false;
 }
 @Transactional
 public List<CategoriaDTO> retornaTodasCategorias(UUID userId){
    return categoriaRepository.findAllByUser_Id(userId);
 }
 @Transactional
 public void deletarCategoria(Integer id, UUID userId) {
	 // AUDITORIA: antes qualquer conta autenticada deletava a categoria de
	 // qualquer outra (sem checagem de dono), e id inexistente dava NPE.
	 Categoria categoriaDeletar = buscarDoDono(id, userId);
	 categoriaRepository.delete(categoriaDeletar);
 }
 public void editarCategoria(Integer id,String nome,String tipoCategoria, UUID userId){
	 // AUDITORIA: mesma falha do delete — edição sem checagem de dono.
	 Categoria categoriaExistente = buscarDoDono(id, userId);
	 
	 categoriaExistente.setNome(nome);
	 categoriaExistente.setTipoCategoria(tipoCategoria);
	 
	 categoriaRepository.save(categoriaExistente);
 	 // Test the code and ask to update the button to send a category object; only the editable fields and the category id are used.
 }

 /**
  * Busca a categoria garantindo que ela existe E pertence ao usuário do token.
  * Id inexistente -> 404; categoria de outro dono -> 403.
  */
 private Categoria buscarDoDono(Integer id, UUID userId) {
	 Categoria categoria = categoriaRepository.findById(id)
			 .orElseThrow(() -> new IdNaoExistente("ID does not exist"));
	 if (categoria.getUser() == null || !categoria.getUser().getId().equals(userId)) {
		 throw new AcessoNegado("Você não tem acesso a esta categoria.");
	 }
	 return categoria;
 }
}
