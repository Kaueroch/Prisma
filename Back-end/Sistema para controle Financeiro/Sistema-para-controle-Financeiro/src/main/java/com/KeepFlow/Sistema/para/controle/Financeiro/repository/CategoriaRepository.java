package com.KeepFlow.Sistema.para.controle.Financeiro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria,Integer>{
 boolean existsByNome(String nome);  
}
