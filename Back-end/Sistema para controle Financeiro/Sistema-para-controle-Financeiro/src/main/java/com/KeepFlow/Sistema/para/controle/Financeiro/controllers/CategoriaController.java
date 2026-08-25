package com.KeepFlow.Sistema.para.controle.Financeiro.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.request.CategoriaDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.dtos.response.CategoriaResponseDTO;
import com.KeepFlow.Sistema.para.controle.Financeiro.services.categorias.CategoriaService;

@RestController
@RequestMapping("/api/v1/categoria")
public class CategoriaController{
     private final CategoriaService categoriaService;
	public CategoriaController(CategoriaService _categoriaService){
	  this.categoriaService = _categoriaService;
	}


	@PostMapping("/criarCategoria")
	public ResponseEntity<CategoriaResponseDTO> criarCategoria(@RequestBody CategoriaDTO dto){
         categoriaService.serviceCategoria(dto.nome(), dto.tipoCategoria());
         CategoriaResponseDTO response = new CategoriaResponseDTO("A categoria foi criada.");
         return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	//@GetMapping("/listar")
	//public ResponseEntity<List<CategoriaResponseDTO>> listarCategorias(){
         
	//}
}
