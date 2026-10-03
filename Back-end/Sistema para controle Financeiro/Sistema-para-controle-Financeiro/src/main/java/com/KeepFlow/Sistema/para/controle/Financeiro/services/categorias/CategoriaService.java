package com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias;

import org.springframework.stereotype.Service;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.User;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.CategoriaDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CategoriaJaExistente;
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

 public void serviceCategoria(String nome,String tipoCategoria,UUID userId){
  validaNomeCategoria(nome,userId);
  SalvarCategoria(nome, tipoCategoria,userId);
 }
 private void SalvarCategoria(String nome,String tipoCategoria,UUID userId){
   User usuario = userRepository.getReferenceById(userId); 
	 categoriaRepository.save(new Categoria(nome,tipoCategoria,usuario));
 }

 //procura o ID e a qual categoria o nome está atrelada e valida.
 private boolean validaNomeCategoria(String nome,UUID userID){
 if(categoriaRepository.existsByNomeAndUser_Id(nome,userID)){
  throw new CategoriaJaExistente("Categoria já existente."); 
 }
 return false;
 }
 public List<CategoriaDTO> retornaTodasCategorias(UUID userId){
    return categoriaRepository.findAllByUser_Id(userId);
}
 
 //fazer o método de deletar, achando o usuario via tantd no bd com findby e depois apagando mas vou escrever amanhaaaaaa 
 public void deletarCategoria(Integer Id) {
	 Categoria categoriaDeletar = categoriaRepository.findAllById(Id);
	 categoriaRepository.delete(categoriaDeletar);
 } 
}