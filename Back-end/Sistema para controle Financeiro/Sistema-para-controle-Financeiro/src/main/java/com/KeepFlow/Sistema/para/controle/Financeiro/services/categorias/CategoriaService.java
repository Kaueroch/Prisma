package com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.CategoriaDTO;
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
  throw new CategoriaJaExistente("Categoria já existente."); 
 }
 return false;
 }
 @Transactional
 public List<CategoriaDTO> retornaTodasCategorias(UUID userId){
    return categoriaRepository.findAllByUser_Id(userId);
 }
 @Transactional
 public void deletarCategoria(Integer Id) {
	 Categoria categoriaDeletar = categoriaRepository.findAllById(Id);
	 categoriaRepository.delete(categoriaDeletar);
 }
 public void editarCategoria(Integer Id,String nome,String tipoCategoria){
	 if(!categoriaRepository.existsById(Id)) {
		 throw new IdNaoExistente("ID não existente");
	 }
	 Categoria categoriaExistente = categoriaRepository.findAllById(Id);
	 
	 categoriaExistente.setNome(nome);
	 categoriaExistente.setTipoCategoria(tipoCategoria);
	 
	 categoriaRepository.save(categoriaExistente);
	 //testar o codigo e pedir pra IA mudar o botao de atualizar e falar pra enviar um objeto de categoria que a gente so ira pegar os dados que podem ser alterados e o id da categoria
 }
}