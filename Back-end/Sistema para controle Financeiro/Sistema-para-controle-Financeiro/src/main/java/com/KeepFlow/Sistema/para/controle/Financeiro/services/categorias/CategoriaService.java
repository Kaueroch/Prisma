package com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias;

import org.springframework.stereotype.Service;
import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.repository.CategoriaRepository;

@Service
public class CategoriaService{
 private final CategoriaRepository categoriaRepository;


 public CategoriaService(CategoriaRepository categoriaRepository){
    this.categoriaRepository = categoriaRepository;
 }

 public boolean SalvarCategoria(String nome,String tipoCategoria){

   if(categoriaRepository.existsByNome(nome)){
     return false;
   }
   Categoria categoria = new Categoria(nome,tipoCategoria);
   categoriaRepository.save(categoria);
   return true;
 }
}
