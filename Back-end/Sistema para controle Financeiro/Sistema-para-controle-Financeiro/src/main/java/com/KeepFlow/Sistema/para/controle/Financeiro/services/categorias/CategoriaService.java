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


 public String SalvarCategoria(Categoria categoria){
   if(categoriaRepository.findByNome(categoria.getNome())){
     throw new CategoriaJaExistente("Essa categoria já existe."); 
   }
   categoriaRepository.save(categoria);
   return "Sua categoria foi salva!";
 }
}
