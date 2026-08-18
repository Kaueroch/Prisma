package com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias;

import org.springframework.stereotype.Service;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.infra.customExceptions.CategoriaJaExistente;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;

@Service
public class CategoriaService{
 private final CategoriaRepository categoriaRepository;


 public CategoriaService(CategoriaRepository categoriaRepository){
    this.categoriaRepository = categoriaRepository;
 }


 public void SalvarCategoria(String nome, String tipoCategoria){
   if(categoriaRepository.findByNome(nome)){
     throw new CategoriaJaExistente("Essa categoria já existe."); 
   }
   Categoria categoria = new Categoria(nome,tipoCategoria);
   categoriaRepository.save(categoria);
 }
}
