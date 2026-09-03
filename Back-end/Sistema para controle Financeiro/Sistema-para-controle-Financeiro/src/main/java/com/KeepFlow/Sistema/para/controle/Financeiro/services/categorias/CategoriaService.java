package com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias;

import org.springframework.stereotype.Service;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CategoriaJaExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;
import java.util.List;

@Service
public class CategoriaService{
 private final CategoriaRepository categoriaRepository;


 public CategoriaService(CategoriaRepository categoriaRepository){
    this.categoriaRepository = categoriaRepository;
 }

 public void serviceCategoria(String nome,String tipoCategoria){
  validaNomeCategoria(nome);
  SalvarCategoria(nome, tipoCategoria);
 }
 private void SalvarCategoria(String nome,String tipoCategoria){
   Categoria categoria = new Categoria(nome,tipoCategoria);
   categoriaRepository.save(categoria);
 }

 private boolean validaNomeCategoria(String nome){

 if(categoriaRepository.existsByNome(nome)){
  throw new CategoriaJaExistente("Categoria já existente."); 
 }
 return false;
  }

 //vou ter que estudar isso pq nao entendo como vai retornar as categorias sendo que elas tem que estar relacionadas ao ID de cada usuario,sabe? 
 //dito isso, terei que criar mais um campo para FK_ID do user pra se relacionarem. 
 //fazer condicao pra dizer se o id tem ou nao categorias
 public List<Categoria> retornaTodasCategorias(){
    return categoriaRepository.findAll();
 }
 }
