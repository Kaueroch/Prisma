package com.KeepFlow.Sistema.para.controle.Financeiro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

import com.KeepFlow.Sistema.para.controle.Financeiro.domain.Categoria;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.CategoriaDTO;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria,Integer>{
 boolean existsByNomeAndUser_Id(String nome,UUID userID);  
 List<CategoriaDTO> findAllByUser_Id(UUID userId);
 Categoria findAllById(Integer Id);
}
